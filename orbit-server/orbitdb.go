package main

import (
	"bufio"
	"context"
	"fmt"
	"os"
	"path/filepath"
	"strings"

	"berty.tech/go-orbit-db/accesscontroller"
	orbitdb "berty.tech/go-orbit-db"
	"berty.tech/go-orbit-db/iface"

	"github.com/ipfs/kubo/client/rpc"
	coreiface "github.com/ipfs/kubo/core/coreiface"
	ma "github.com/multiformats/go-multiaddr"
)

// dbAddrFile is the filename used to persist database addresses
// inside the data directory, so subsequent runs can find the same DB.
// When there are multiple databases, the file contains one "name:address" line per DB.
const dbAddrFile = "dbaddr"

// ----------------------------------------------------------------
// Single Client (unchanged – operates one DocumentStore)
// ----------------------------------------------------------------

// Client provides a high-level API for OrbitDB document store operations,
// similar to the JavaScript orbitdb.connect() / put() / get() / all() pattern.
type Client struct {
	ctx     context.Context
	cancel  context.CancelFunc
	api     coreiface.CoreAPI
	orbitDB iface.OrbitDB
	db      iface.DocumentStore
	dbName  string
	dbAddr  string
}

// NewClient creates a new Client by connecting to a local Kubo IPFS daemon.
func NewClient(ctx context.Context, kuboMultiAddr string, dbName string, dir string) (*Client, error) {
	ctx, cancel := context.WithCancel(ctx)

	// 1. Parse the multiaddress and connect to the Kubo daemon
	maddr, err := ma.NewMultiaddr(kuboMultiAddr)
	if err != nil {
		cancel()
		return nil, fmt.Errorf("invalid kubo multiaddress: %w", err)
	}

	api, err := rpc.NewApi(maddr)
	if err != nil {
		cancel()
		return nil, fmt.Errorf("unable to connect to kubo daemon: %w", err)
	}

	// 2. Create the OrbitDB instance
	orbitDB, err := orbitdb.NewOrbitDB(ctx, api, &orbitdb.NewOrbitDBOptions{
		Directory: &dir,
	})
	if err != nil {
		cancel()
		return nil, fmt.Errorf("unable to create orbitdb: %w", err)
	}

	// 3. Check if we already have a persisted database address for this name
	persistedAddr := readPersistedDBAddr(dir, dbName)

	var docStore iface.DocumentStore

	if persistedAddr != "" {
		// 3a. Address exists → open the existing database
		var s iface.Store
		s, err = orbitDB.Open(ctx, persistedAddr, &iface.CreateDBOptions{
			Directory: &dir,
		})
		if err != nil {
			cancel()
			orbitDB.Close()
			return nil, fmt.Errorf("unable to open existing document store at %s: %w", persistedAddr, err)
		}

		var ok bool
		docStore, ok = s.(iface.DocumentStore)
		if !ok {
			cancel()
			orbitDB.Close()
			return nil, fmt.Errorf("unable to cast store to document store")
		}

		// Load existing entries from IPFS
		if err := docStore.Load(ctx, -1); err != nil {
			cancel()
			orbitDB.Close()
			return nil, fmt.Errorf("unable to load existing document store: %w", err)
		}
	} else {
		// 3b. No persisted address → create a new database
		access := accesscontroller.NewEmptyManifestParams()
		access.SetType("ipfs")
		access.SetAccess("write", []string{"*"})

		docStore, err = orbitDB.Docs(ctx, dbName, &iface.CreateDBOptions{
			AccessController: access,
			Directory:        &dir,
		})
		if err != nil {
			cancel()
			orbitDB.Close()
			return nil, fmt.Errorf("unable to open document store: %w", err)
		}

		// Persist the real address so subsequent runs find the same database
		dbAddress := docStore.Address().String()
		if err := persistDBAddr(dir, dbName, dbAddress); err != nil {
			cancel()
			orbitDB.Close()
			docStore.Close()
			return nil, fmt.Errorf("unable to persist database address: %w", err)
		}
	}

	return &Client{
		ctx:     ctx,
		cancel:  cancel,
		api:     api,
		orbitDB: orbitDB,
		db:      docStore,
		dbName:  dbName,
		dbAddr:  docStore.Address().String(),
	}, nil
}

// Put stores a document in the database.
func (c *Client) Put(ctx context.Context, doc map[string]interface{}) error {
	_, err := c.db.Put(ctx, doc)
	if err != nil {
		return fmt.Errorf("unable to put document: %w", err)
	}
	return nil
}

// Get retrieves a document by its _id field.
func (c *Client) Get(ctx context.Context, id string) (map[string]interface{}, error) {
	docs, err := c.db.Get(ctx, id, nil)
	if err != nil {
		return nil, fmt.Errorf("unable to get document: %w", err)
	}
	if len(docs) == 0 {
		return nil, nil
	}

	doc, ok := docs[0].(map[string]interface{})
	if !ok {
		return nil, fmt.Errorf("document is not a map")
	}

	return doc, nil
}

// All returns all documents in the database.
func (c *Client) All(ctx context.Context) ([]map[string]interface{}, error) {
	allDocs, err := c.db.Query(ctx, func(doc interface{}) (bool, error) {
		return true, nil
	})
	if err != nil {
		return nil, fmt.Errorf("unable to query all documents: %w", err)
	}

	result := make([]map[string]interface{}, 0, len(allDocs))
	for _, d := range allDocs {
		doc, ok := d.(map[string]interface{})
		if !ok {
			continue
		}
		result = append(result, doc)
	}

	return result, nil
}

// Delete removes a document by its _id.
func (c *Client) Delete(ctx context.Context, id string) error {
	_, err := c.db.Delete(ctx, id)
	if err != nil {
		return fmt.Errorf("unable to delete document: %w", err)
	}
	return nil
}

// Query finds documents using a filter function.
func (c *Client) Query(ctx context.Context, filter func(doc map[string]interface{}) (bool, error)) ([]map[string]interface{}, error) {
	allDocs, err := c.db.Query(ctx, func(doc interface{}) (bool, error) {
		m, ok := doc.(map[string]interface{})
		if !ok {
			return false, nil
		}
		return filter(m)
	})
	if err != nil {
		return nil, fmt.Errorf("unable to query documents: %w", err)
	}

	result := make([]map[string]interface{}, 0, len(allDocs))
	for _, d := range allDocs {
		doc, ok := d.(map[string]interface{})
		if !ok {
			continue
		}
		result = append(result, doc)
	}

	return result, nil
}

// Close closes the database and releases resources.
func (c *Client) Close() error {
	var errs []error

	if err := c.db.Close(); err != nil {
		errs = append(errs, fmt.Errorf("close db: %w", err))
	}
	if err := c.orbitDB.Close(); err != nil {
		errs = append(errs, fmt.Errorf("close orbitdb: %w", err))
	}

	c.cancel()

	if len(errs) > 0 {
		return fmt.Errorf("close errors: %v", errs)
	}
	return nil
}

// DBName returns the name of the database.
func (c *Client) DBName() string {
	return c.dbName
}

// DBAddr returns the persisted OrbitDB address of the database.
func (c *Client) DBAddr() string {
	return c.dbAddr
}

// DB returns the underlying DocumentStore for advanced operations.
func (c *Client) DB() iface.DocumentStore {
	return c.db
}

// IPFS returns the underlying IPFS CoreAPI.
func (c *Client) IPFS() coreiface.CoreAPI {
	return c.api
}

// OrbitDB returns the underlying OrbitDB instance.
func (c *Client) OrbitDB() iface.OrbitDB {
	return c.orbitDB
}

// ----------------------------------------------------------------
// MultiClient – manages multiple named databases
// ----------------------------------------------------------------

// MultiClient manages multiple Client instances, one per database name.
type MultiClient struct {
	ctx       context.Context
	cancel    context.CancelFunc
	kuboAPI   string
	api       coreiface.CoreAPI
	orbitDB   iface.OrbitDB // shared OrbitDB instance across all databases
	clients   map[string]*Client
}

// NewMultiClient creates one Client per DBConfig entry, all sharing the
// same Kubo API connection AND the same OrbitDB instance (to avoid keystore
// lock conflicts when databases reside in the same directory).
func NewMultiClient(ctx context.Context, kuboAPIAddr string, dbs []DBConfig) (*MultiClient, error) {
	ctx, cancel := context.WithCancel(ctx)

	// 1. Parse the multiaddress and connect to the Kubo daemon
	maddr, err := ma.NewMultiaddr(kuboAPIAddr)
	if err != nil {
		cancel()
		return nil, fmt.Errorf("invalid kubo multiaddress: %w", err)
	}

	api, err := rpc.NewApi(maddr)
	if err != nil {
		cancel()
		return nil, fmt.Errorf("unable to connect to kubo daemon: %w", err)
	}

	// 2. Create a single shared OrbitDB instance (the first non-empty directory
	//    is used for keystore; all DBs share it).
	var orbitDBDir string
	for _, db := range dbs {
		if db.Dir != "" {
			orbitDBDir = db.Dir
			break
		}
	}
	if orbitDBDir == "" {
		orbitDBDir = "./orbitdb-data"
	}
	if err := os.MkdirAll(orbitDBDir, 0755); err != nil {
		cancel()
		return nil, fmt.Errorf("create orbitdb directory: %w", err)
	}

	orbitDB, err := orbitdb.NewOrbitDB(ctx, api, &orbitdb.NewOrbitDBOptions{
		Directory: &orbitDBDir,
	})
	if err != nil {
		cancel()
		return nil, fmt.Errorf("unable to create shared orbitdb instance: %w", err)
	}

	mc := &MultiClient{
		ctx:     ctx,
		cancel:  cancel,
		kuboAPI: kuboAPIAddr,
		api:     api,
		orbitDB: orbitDB,
		clients: make(map[string]*Client, len(dbs)),
	}

	// 3. Open (or create) one DocumentStore per database name
	for _, db := range dbs {
		if err := os.MkdirAll(db.Dir, 0755); err != nil {
			cancel()
			mc.Close()
			return nil, fmt.Errorf("create directory for db %q: %w", db.Name, err)
		}

		client, err := openStore(ctx, mc, db.Name, db.Dir)
		if err != nil {
			cancel()
			mc.Close()
			return nil, fmt.Errorf("create client for db %q: %w", db.Name, err)
		}
		mc.clients[db.Name] = client
	}

	return mc, nil
}

// openStore opens an existing DocumentStore or creates a new one, using the
// shared OrbitDB instance from mc, and returns a Client wrapping it.
func openStore(ctx context.Context, mc *MultiClient, dbName, dir string) (*Client, error) {
	// 1. Try to find a persisted address
	persistedAddr := readPersistedDBAddr(dir, dbName)

	var docStore iface.DocumentStore

	if persistedAddr != "" {
		// 1a. Address exists → open existing
		s, err := mc.orbitDB.Open(ctx, persistedAddr, &iface.CreateDBOptions{
			Directory: &dir,
		})
		if err != nil {
			return nil, fmt.Errorf("unable to open existing document store at %s: %w", persistedAddr, err)
		}

		var ok bool
		docStore, ok = s.(iface.DocumentStore)
		if !ok {
			s.Close()
			return nil, fmt.Errorf("unable to cast store to document store")
		}

		if err := docStore.Load(ctx, -1); err != nil {
			docStore.Close()
			return nil, fmt.Errorf("unable to load existing document store: %w", err)
		}
	} else {
		// 1b. No persisted address → create new
		access := accesscontroller.NewEmptyManifestParams()
		access.SetType("ipfs")
		access.SetAccess("write", []string{"*"})

		var err error
		docStore, err = mc.orbitDB.Docs(ctx, dbName, &iface.CreateDBOptions{
			AccessController: access,
			Directory:        &dir,
		})
		if err != nil {
			return nil, fmt.Errorf("unable to create document store: %w", err)
		}

		// Persist the address
		dbAddress := docStore.Address().String()
		if err := persistDBAddr(dir, dbName, dbAddress); err != nil {
			docStore.Close()
			return nil, fmt.Errorf("unable to persist database address: %w", err)
		}
	}

	return &Client{
		ctx:     ctx,
		cancel:  nil, // cancellation managed by MultiClient
		api:     mc.api,
		orbitDB: mc.orbitDB,
		db:      docStore,
		dbName:  dbName,
		dbAddr:  docStore.Address().String(),
	}, nil
}

// ClientByName returns the Client for the given database name.
// Returns nil and false if no database with that name exists.
func (mc *MultiClient) ClientByName(name string) (*Client, bool) {
	c, ok := mc.clients[name]
	return c, ok
}

// ForEach calls fn for each database client.
func (mc *MultiClient) ForEach(fn func(name string, c *Client) error) error {
	for name, c := range mc.clients {
		if err := fn(name, c); err != nil {
			return err
		}
	}
	return nil
}

// Names returns all registered database names.
func (mc *MultiClient) Names() []string {
	names := make([]string, 0, len(mc.clients))
	for name := range mc.clients {
		names = append(names, name)
	}
	return names
}

// Close closes all database stores and the shared OrbitDB instance.
func (mc *MultiClient) Close() error {
	var errs []error

	// Close each DocumentStore (but NOT the shared OrbitDB)
	for name, c := range mc.clients {
		if err := c.db.Close(); err != nil {
			errs = append(errs, fmt.Errorf("close store %q: %w", name, err))
		}
	}

	// Close the shared OrbitDB instance
	if err := mc.orbitDB.Close(); err != nil {
		errs = append(errs, fmt.Errorf("close shared orbitdb: %w", err))
	}

	mc.cancel()

	if len(errs) > 0 {
		return fmt.Errorf("multi-close errors: %v", errs)
	}
	return nil
}

// ----------------------------------------------------------------
// dbaddr file helpers – multi-line format "name:address"
// ----------------------------------------------------------------

// dbAddrPath returns the path to the shared dbaddr file inside dir.
func dbAddrPath(dir string) string {
	return filepath.Join(dir, dbAddrFile)
}

// readPersistedDBAddr reads the dbaddr file in dir and returns the address
// for the given dbName, or "" if not found.
func readPersistedDBAddr(dir, dbName string) string {
	path := dbAddrPath(dir)
	f, err := os.Open(path)
	if err != nil {
		return ""
	}
	defer f.Close()

	scanner := bufio.NewScanner(f)
	for scanner.Scan() {
		line := strings.TrimSpace(scanner.Text())
		if line == "" {
			continue
		}
		// Try "name:address" format first
		if idx := strings.IndexByte(line, ':'); idx > 0 {
			name := line[:idx]
			addr := line[idx+1:]
			if name == dbName {
				return addr
			}
		} else {
			// Backward compatibility: single line without colon → assume
			// it belongs to the first/only database name.
			return line
		}
	}
	return ""
}

// persistDBAddr writes (or updates) a "dbName:dbAddress" line in the dbaddr
// file inside dir. Other entries are preserved.
func persistDBAddr(dir, dbName, dbAddress string) error {
	path := dbAddrPath(dir)

	// Read existing lines
	existing := make(map[string]string)
	f, err := os.Open(path)
	if err == nil {
		scanner := bufio.NewScanner(f)
		for scanner.Scan() {
			line := strings.TrimSpace(scanner.Text())
			if line == "" {
				continue
			}
			if idx := strings.IndexByte(line, ':'); idx > 0 {
				name := line[:idx]
				addr := line[idx+1:]
				existing[name] = addr
			}
		}
		f.Close()
	}

	// Upsert the current entry
	existing[dbName] = dbAddress

	// Write back all entries
	if err := os.MkdirAll(dir, 0755); err != nil {
		return fmt.Errorf("ensure dir: %w", err)
	}

	out, err := os.Create(path)
	if err != nil {
		return fmt.Errorf("create dbaddr file: %w", err)
	}
	defer out.Close()

	for name, addr := range existing {
		if _, err := fmt.Fprintf(out, "%s:%s\n", name, addr); err != nil {
			return fmt.Errorf("write dbaddr entry: %w", err)
		}
	}

	return nil
}