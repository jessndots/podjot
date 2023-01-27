\echo 'Delete and recreate podcast db?'
\prompt 'Return for yes or control-C to cancel > ' foo

DROP DATABASE podcast;
CREATE DATABASE podcast;
\connect podcast

\i podcast-schema.sql

\echo 'Delete and recreate podcast_test db?'
\prompt 'Return for yes or control-C to cancel > ' foo

DROP DATABASE podcast_test;
CREATE DATABASE podcast_test;
\connect podcast_test

\i podcast-schema.sql