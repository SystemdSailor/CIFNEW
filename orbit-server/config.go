package main

import (
	"encoding/json"
	"fmt"
	"os"
)

// DBConfig holds configuration for a single OrbitDB database.
type DBConfig struct {
	Name string `json:"name"`
	Dir  string `json:"dir"`
}

// Config holds the server configuration loaded from orbit-config.json.
type Config struct {
	KuboAPIAddr string     `json:"kuboApiAddr"`
	Port        int        `json:"port"`
	DBs         []DBConfig `json:"dbs"`
	DBDir       string     `json:"dbDir"` // kept for backward compatibility if "dbs" is not set
	DBName      string     `json:"dbName"` // kept for backward compatibility
}

// DefaultConfig returns a Config with sensible defaults.
func DefaultConfig() Config {
	return Config{
		KuboAPIAddr: "/ip4/127.0.0.1/tcp/5001",
		Port:        3456,
		DBDir:       "./orbitdb-data",
	}
}

// LoadConfig reads and parses the config file at the given path.
func LoadConfig(path string) (Config, error) {
	cfg := DefaultConfig()

	data, err := os.ReadFile(path)
	fmt.Printf("  os.ReadFile(%s): %s\n", path,data)
	if err != nil {
		if os.IsNotExist(err) {
			return cfg, nil
		}
		return cfg, fmt.Errorf("read config: %w", err)
	}

	if err := json.Unmarshal(data, &cfg); err != nil {
		return cfg, fmt.Errorf("parse config: %w", err)
	}

	// If "dbs" is not configured but old-style dbName/dbDir is, migrate it.
	if len(cfg.DBs) == 0 && cfg.DBName != "" {
		dir := cfg.DBDir
		if dir == "" {
			dir = "./orbitdb-data"
		}
		cfg.DBs = []DBConfig{
			{Name: cfg.DBName, Dir: dir},
		}
	}

	// Ensure each db entry has a default directory if missing.
	for i := range cfg.DBs {
		if cfg.DBs[i].Dir == "" {
			cfg.DBs[i].Dir = "./orbitdb-data"
		}
	}

	return cfg, nil
}