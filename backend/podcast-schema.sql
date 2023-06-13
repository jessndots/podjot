CREATE TABLE users (
  username varchar(25) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL
    CHECK (position('@' IN email) > 1),
  password TEXT NOT NULL, 
  first_name TEXT NOT NULL, 
  last_name TEXT NOT NULL,
  is_admin boolean NOT NULL DEFAULT FALSE
);

CREATE TABLE episode_tags (
  id SERIAL PRIMARY KEY,
  username varchar NOT NULL,
  episode_id varchar NOT NULL,
  tag varchar(50) NOT NULL
);

CREATE TABLE podcast_tags (
  id SERIAL PRIMARY KEY,
  username varchar NOT NULL,
  podcast_id varchar NOT NULL,
  tag varchar(50) NOT NULL
);

CREATE TABLE user_episodes (
  username varchar NOT NULL,
  episode_id varchar NOT NULL,
  date_listened date,
  time_stopped time,
  favorite boolean,
  rating integer CHECK (rating <= 5),
  notes text, 
  PRIMARY KEY (username, episode_id)
);

CREATE TABLE user_podcasts (
  username varchar NOT NULL,
  podcast_id varchar NOT NULL,
  date_added date NOT NULL DEFAULT 'now()',
  favorite boolean,
  rating integer CHECK (rating <= 5),
  notes text, 
  PRIMARY KEY (username, podcast_id)
);

CREATE TABLE listen_later (
  id SERIAL PRIMARY KEY,
  username varchar NOT NULL,
  episode_id varchar NOT NULL,
  date_added date NOT NULL DEFAULT 'now()'
);

ALTER TABLE user_episodes ADD FOREIGN KEY (username) REFERENCES users (username) ON DELETE CASCADE;

ALTER TABLE user_podcasts ADD FOREIGN KEY (username) REFERENCES users (username) ON DELETE CASCADE;

ALTER TABLE listen_later ADD FOREIGN KEY (username) REFERENCES users (username) ON DELETE CASCADE;

ALTER TABLE episode_tags ADD FOREIGN KEY (username) REFERENCES users (username) ON DELETE CASCADE;

ALTER TABLE podcast_tags ADD FOREIGN KEY (username) REFERENCES users (username) ON DELETE CASCADE;
