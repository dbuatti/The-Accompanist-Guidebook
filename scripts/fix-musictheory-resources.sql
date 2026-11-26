-- musictheory.net renumbered its lessons; several bookmarked links returned
-- 404 or pointed at the wrong topic. Map each resource title to the live
-- canonical lesson and keep the displayed title accurate.
UPDATE resources SET title = 'musictheory.net — The Staff', url = 'https://www.musictheory.net/lessons/10' WHERE url = 'https://www.musictheory.net/lessons/1';
UPDATE resources SET title = 'musictheory.net — Note Duration', url = 'https://www.musictheory.net/lessons/11' WHERE url = 'https://www.musictheory.net/lessons/4';
UPDATE resources SET title = 'musictheory.net — Key Signatures', url = 'https://www.musictheory.net/lessons/24' WHERE title = 'musictheory.net — Key Signatures' AND url = 'https://www.musictheory.net/lessons/10';
UPDATE resources SET title = 'musictheory.net — Major Scales', url = 'https://www.musictheory.net/lessons/21' WHERE title = 'musictheory.net — Major Scales' AND url = 'https://www.musictheory.net/lessons/11';
UPDATE resources SET title = 'musictheory.net — Time Signatures', url = 'https://www.musictheory.net/lessons/12' WHERE url = 'https://www.musictheory.net/lessons/13';
UPDATE resources SET title = 'musictheory.net — Rhythm & Meter', url = 'https://www.musictheory.net/lessons/15' WHERE url = 'https://www.musictheory.net/lessons/14';
UPDATE resources SET title = 'musictheory.net — Steps & Accidentals', url = 'https://www.musictheory.net/lessons/20' WHERE url = 'https://www.musictheory.net/lessons/42';
