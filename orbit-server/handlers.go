package main

import (
	"context"
	"encoding/json"
	"net/http"
	"strings"
	"time"
)

// orbitClient interface abstracts the Client for handler testing.
type orbitClient interface {
	Put(ctx context.Context, doc map[string]interface{}) error
	Get(ctx context.Context, id string) (map[string]interface{}, error)
	All(ctx context.Context) ([]map[string]interface{}, error)
	Close() error
}

// RegisterRoutes sets up all HTTP routes on the given mux.
// When mc has only one database, legacy routes (without {name}) are also
// registered for backward compatibility.
func RegisterRoutes(mux *http.ServeMux, mc *MultiClient) {
	// P2P / status endpoints – no DB required
	mux.HandleFunc("/api/ping", handlePing)
	mux.HandleFunc("/api/p2p/status", handleP2PStatus(mc))
	mux.HandleFunc("/api/p2p/peers", handleP2PPeers(mc))
	mux.HandleFunc("/api/dbs", handleListDBs(mc))

	// Per-database CRUD routes: /api/db/{name}/...
	mux.HandleFunc("/api/db/", handleDBNamed(mc))

	// Legacy single-database routes (registered for backward compatibility
	// when only one database exists).
	if len(mc.Names()) == 1 {
		// Get the single client
		var single *Client
		mc.ForEach(func(name string, c *Client) error {
			single = c
			return nil
		})
		mux.HandleFunc("/api/db/put", handleDBPut(single))
		mux.HandleFunc("/api/db/get/", handleDBGet(single))
		mux.HandleFunc("/api/db/all", handleDBAll(single))
	}
}

// ---------- Helpers ----------

func writeJSON(w http.ResponseWriter, status int, v interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(v)
}

func writeError(w http.ResponseWriter, status int, msg string) {
	writeJSON(w, status, map[string]string{"error": msg})
}

// ---------- Handlers ----------

func handlePing(w http.ResponseWriter, r *http.Request) {
	writeJSON(w, http.StatusOK, map[string]interface{}{
		"ok":        true,
		"timestamp": nowMS(),
	})
}

func handleP2PStatus(mc *MultiClient) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		ctx := r.Context()

		// Use the first available client to get peer info.
		var client *Client
		mc.ForEach(func(name string, c *Client) error {
			client = c
			return nil
		})

		key, _ := client.IPFS().Key().Self(ctx)
		peerID := ""
		connected := false
		peerCount := 0

		if key != nil {
			peerID = key.ID().String()
			connected = true
		}

		peers, _ := client.IPFS().Swarm().Peers(ctx)
		if peers != nil {
			peerCount = len(peers)
		}

		writeJSON(w, http.StatusOK, map[string]interface{}{
			"connected": connected,
			"peerId":    peerID,
			"peers":     peerCount,
		})
	}
}

func handleP2PPeers(mc *MultiClient) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		ctx := r.Context()

		var client *Client
		mc.ForEach(func(name string, c *Client) error {
			client = c
			return nil
		})

		peers, _ := client.IPFS().Swarm().Peers(ctx)

		peerList := make([]map[string]interface{}, 0)
		for _, p := range peers {
			latencyStr := ""
			if lat, err := p.Latency(); err == nil {
				latencyStr = lat.String()
			}
			peerList = append(peerList, map[string]interface{}{
				"peer":    p.ID().String(),
				"addr":    p.Address().String(),
				"latency": latencyStr,
			})
		}

		writeJSON(w, http.StatusOK, map[string]interface{}{
			"peers": peerList,
		})
	}
}

// handleListDBs returns the list of available database names.
func handleListDBs(mc *MultiClient) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		names := mc.Names()
		writeJSON(w, http.StatusOK, names)
	}
}

// handleDBNamed routes /api/db/{name}/... to the appropriate DB.
// Supported sub-paths:
//   /api/db/{name}/put   (POST)
//   /api/db/{name}/get/{id} (GET)
//   /api/db/{name}/all   (GET)
func handleDBNamed(mc *MultiClient) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// Path: /api/db/{name}/...
		trimmed := strings.TrimPrefix(r.URL.Path, "/api/db/")
		parts := strings.SplitN(trimmed, "/", 2)
		if len(parts) < 2 {
			writeError(w, http.StatusBadRequest, "missing db name and action")
			return
		}

		dbName := parts[0]
		action := parts[1]

		client, ok := mc.ClientByName(dbName)
		if !ok {
			writeError(w, http.StatusNotFound, "unknown database: "+dbName)
			return
		}

		switch {
		case action == "put" && r.Method == http.MethodPost:
			handleDBPut(client)(w, r)
		case strings.HasPrefix(action, "get/"):
			// Rewrite the request URL path for the legacy handler
			id := strings.TrimPrefix(action, "get/")
			r.URL.Path = "/api/db/get/" + id
			handleDBGet(client)(w, r)
		case action == "all" && r.Method == http.MethodGet:
			handleDBAll(client)(w, r)
		default:
			writeError(w, http.StatusNotFound, "unsupported action: "+action)
		}
	}
}

// ---------- Legacy Handlers (single-client, used both directly and via named router) ----------

func handleDBPut(client orbitClient) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			writeError(w, http.StatusMethodNotAllowed, "POST required")
			return
		}

		var doc map[string]interface{}
		if err := json.NewDecoder(r.Body).Decode(&doc); err != nil {
			writeError(w, http.StatusBadRequest, "invalid JSON body")
			return
		}

		if doc == nil {
			writeError(w, http.StatusBadRequest, "invalid document")
			return
		}

		if err := client.Put(r.Context(), doc); err != nil {
			writeError(w, http.StatusInternalServerError, err.Error())
			return
		}

		id := ""
		if v, ok := doc["_id"]; ok {
			id, _ = v.(string)
		}

		writeJSON(w, http.StatusOK, map[string]interface{}{
			"ok": true,
			"id": id,
		})
	}
}

func handleDBGet(client orbitClient) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		id := strings.TrimPrefix(r.URL.Path, "/api/db/get/")
		if id == "" {
			writeError(w, http.StatusBadRequest, "id required")
			return
		}

		doc, err := client.Get(r.Context(), id)
		if err != nil {
			writeError(w, http.StatusInternalServerError, err.Error())
			return
		}

		if doc == nil {
			writeJSON(w, http.StatusOK, nil)
			return
		}

		writeJSON(w, http.StatusOK, doc)
	}
}

func handleDBAll(client orbitClient) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		docs, err := client.All(r.Context())
		if err != nil {
			writeError(w, http.StatusInternalServerError, err.Error())
			return
		}

		if docs == nil {
			docs = []map[string]interface{}{}
		}

		writeJSON(w, http.StatusOK, docs)
	}
}

// nowMS returns the current Unix timestamp in milliseconds.
func nowMS() int64 {
	return time.Now().UnixMilli()
}