CREATE TABLE t_p65891949_radio_news_portal.battles (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL DEFAULT '',
    artist1 TEXT NOT NULL,
    artist2 TEXT NOT NULL,
    votes1 INTEGER NOT NULL DEFAULT 0,
    votes2 INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE t_p65891949_radio_news_portal.battle_votes (
    id SERIAL PRIMARY KEY,
    battle_id INTEGER NOT NULL REFERENCES t_p65891949_radio_news_portal.battles(id),
    voter_ip TEXT NOT NULL,
    choice SMALLINT NOT NULL CHECK (choice IN (1, 2)),
    voted_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(battle_id, voter_ip)
);
