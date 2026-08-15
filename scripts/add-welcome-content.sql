CREATE TABLE IF NOT EXISTS welcome_content (
  id text PRIMARY KEY DEFAULT 'welcome',
  title text NOT NULL DEFAULT 'A letter from Daniele',
  content text NOT NULL,
  updated_at timestamp NOT NULL DEFAULT now()
);

INSERT INTO welcome_content (id, title, content) VALUES (
  'welcome',
  'A letter from Daniele',
  '### Welcome in!

I''m Daniele Buatti — a pianist, vocal coach, music director, and educator with over fifteen years in musical theatre. This course is everything I wish every singer knew before they walked into an audition room.

Over the next three levels, you''ll learn how to choose the right songs, cut and prepare your music so any accompanist can play it on sight, deliver your tempo with confidence, and work with the pianist and panel as a true collaborator.

This isn''t about theory for its own sake. Every lesson is built around the practical skills that read as professional the moment you walk into a room — and around helping you feel calm, prepared, and in control.

Take the lessons at your own pace, in any order, and come back whenever you need to. I''ll be here with you the whole way.

Let''s begin.

— Daniele'
) ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, content = EXCLUDED.content, updated_at = now();
