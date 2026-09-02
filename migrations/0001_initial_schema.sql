PRAGMA foreign_keys = ON;

CREATE TABLE organizations (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

CREATE TABLE users (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    display_name TEXT NOT NULL,
    is_active INTEGER NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

CREATE TABLE organization_members (
    id TEXT PRIMARY KEY,
    organization_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    role TEXT NOT NULL,
    status TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    UNIQUE (user_id, organization_id),
    FOREIGN KEY (organization_id) REFERENCES organizations(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    expires_at TEXT NOT NULL,
    created_at TEXT NOT NULL,
    last_used_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE services (
    id TEXT PRIMARY KEY,
    organization_id TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    is_active INTEGER NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (organization_id) REFERENCES organizations(id)
);

CREATE TABLE incidents (
    id TEXT PRIMARY KEY,
    organization_id TEXT NOT NULL,
    service_id TEXT,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    severity TEXT NOT NULL,
    status TEXT NOT NULL,
    created_by TEXT NOT NULL,
    assigned_to TEXT,
    started_at TEXT,
    resolved_at TEXT,
    closed_at TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (organization_id) REFERENCES organizations(id),
    FOREIGN KEY (service_id) REFERENCES services(id),
    FOREIGN KEY (created_by) REFERENCES users(id),
    FOREIGN KEY (assigned_to) REFERENCES users(id)
);

CREATE TABLE incident_events (
    id TEXT PRIMARY KEY,
    incident_id TEXT NOT NULL,
    organization_id TEXT NOT NULL,
    actor_id TEXT NOT NULL,
    type TEXT NOT NULL,
    payload TEXT,
    created_at TEXT NOT NULL,
    FOREIGN KEY (incident_id) REFERENCES incidents(id),
    FOREIGN KEY (organization_id) REFERENCES organizations(id),
    FOREIGN KEY (actor_id) REFERENCES users(id)
);

CREATE TABLE comments (
    id TEXT PRIMARY KEY,
    incident_id TEXT NOT NULL,
    organization_id TEXT NOT NULL,
    author_id TEXT NOT NULL,
    body TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (incident_id) REFERENCES incidents(id),
    FOREIGN KEY (organization_id) REFERENCES organizations(id),
    FOREIGN KEY (author_id) REFERENCES users(id)
);

CREATE TABLE postmortems (
    id TEXT PRIMARY KEY,
    incident_id TEXT NOT NULL UNIQUE,
    organization_id TEXT NOT NULL,
    author_id TEXT NOT NULL,
    summary TEXT NOT NULL,
    impact TEXT NOT NULL,
    root_cause TEXT NOT NULL,
    resolution TEXT NOT NULL,
    lessons_learned TEXT NOT NULL,
    status TEXT NOT NULL,
    published_at TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (incident_id) REFERENCES incidents(id),
    FOREIGN KEY (organization_id) REFERENCES organizations(id),
    FOREIGN KEY (author_id) REFERENCES users(id)
);

CREATE INDEX idx_organization_members_organization_id
    ON organization_members(organization_id);

CREATE INDEX idx_organization_members_user_id
    ON organization_members(user_id);

CREATE INDEX idx_services_organization_id
    ON services(organization_id);

CREATE INDEX idx_incidents_organization_id
    ON incidents(organization_id);

CREATE INDEX idx_incidents_service_id
    ON incidents(service_id);

CREATE INDEX idx_incidents_status
    ON incidents(status);

CREATE INDEX idx_incidents_severity
    ON incidents(severity);

CREATE INDEX idx_incidents_assigned_to
    ON incidents(assigned_to);

CREATE INDEX idx_incidents_created_at
    ON incidents(created_at);

CREATE INDEX idx_incident_events_incident_id
    ON incident_events(incident_id);

CREATE INDEX idx_incident_events_created_at
    ON incident_events(created_at);

CREATE INDEX idx_comments_incident_id
    ON comments(incident_id);

CREATE INDEX idx_comments_created_at
    ON comments(created_at);

CREATE INDEX idx_sessions_user_id
    ON sessions(user_id);

CREATE INDEX idx_sessions_expires_at
    ON sessions(expires_at);

CREATE INDEX idx_postmortems_incident_id
    ON postmortems(incident_id);