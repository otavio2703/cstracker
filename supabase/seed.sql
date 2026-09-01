-- ============================================================
-- CSTracker — Seed: Granadas de Exemplo
-- Execute APÓS a migration 001_initial_schema.sql
-- Estas são granadas de exemplo para popular a UI inicial.
-- Substitua video_url e image_url por URLs reais.
-- ============================================================

INSERT INTO public.grenades (map_name, name, type, side, throw_location, destination, description, video_url, image_url, notes)
VALUES

-- ============================================================
-- MIRAGE
-- ============================================================

('mirage', 'Smoke CT A Site', 'smoke', 't', 'T Spawn / Ramp',
 'CT Spawn A Site',
 'Smoke padrão para fechar o CT no site A. Alinha o mira no topo do prédio à esquerda e joga com run-throw.',
 NULL, NULL, 'Smoke essencial para executa no A'),

('mirage', 'Smoke Window', 'smoke', 't', 'T Spawn',
 'Window',
 'Fecha a Window para executa no A. Posicione no canto da parede e mire na borda do telhado.',
 NULL, NULL, NULL),

('mirage', 'Smoke Jungle A', 'smoke', 'ct', 'A Site',
 'Jungle',
 'CT fecha o Jungle para segurar push T no A.',
 NULL, NULL, NULL),

('mirage', 'Smoke Mid Top', 'smoke', 't', 'T Mid',
 'Top Mid',
 'Fecha o Top Mid para controle seguro. Jump-throw da parede do T Mid.',
 NULL, NULL, NULL),

('mirage', 'Molotov Ticket Booth', 'molotov', 't', 'Ramp',
 'Ticket Booth',
 'Molotov para tirar CTs escondidos no ticket booth durante executa no B.',
 NULL, NULL, NULL),

('mirage', 'Flash A Ramp', 'flash', 't', 'Ramp',
 'A Site',
 'Flash pop para cegar CTs no A Site durante entrada pela Ramp.',
 NULL, NULL, NULL),

-- ============================================================
-- INFERNO
-- ============================================================

('inferno', 'Smoke Balcony B', 'smoke', 'ct', 'CT Spawn',
 'Balcony',
 'Fecha o Balcony para impedir entrada T no B. Alinha na borda do telhado.',
 NULL, NULL, 'Smoke essencial para CTs no B'),

('inferno', 'Smoke Casa B', 'smoke', 't', 'T Spawn',
 'Casa B',
 'Smoke para cegar o ângulo da casa durante executa no B.',
 NULL, NULL, NULL),

('inferno', 'Molotov Sandbags A', 'molotov', 'ct', 'A Site',
 'Sandbags',
 'Molotov no sandbags para limpar posição T durante retake.',
 NULL, NULL, NULL),

('inferno', 'Smoke CT A Site', 'smoke', 't', 'Banana',
 'CT A Site',
 'Smoke para fechar o CT durante executa no A vindo pela Banana.',
 NULL, NULL, NULL),

('inferno', 'Flash Banana', 'flash', 'ct', 'B Site',
 'Banana',
 'Flash pop para cegar Ts vindo pela Banana.',
 NULL, NULL, NULL),

-- ============================================================
-- DUST2
-- ============================================================

('dust2', 'Smoke Long Corner', 'smoke', 'ct', 'CT Mid',
 'Long Corner',
 'Fecha o Long Corner para garantir controle do CT no A.',
 NULL, NULL, NULL),

('dust2', 'Smoke Xbox Mid', 'smoke', 't', 'T Spawn',
 'Xbox',
 'Smoke padrão para controle do Mid. Jump-throw na plataforma.',
 NULL, NULL, 'Essencial para Mid control'),

('dust2', 'Smoke CT A Site', 'smoke', 't', 'Long A',
 'CT Spawn',
 'Fecha o CT durante executa no A vindo pelo Long.',
 NULL, NULL, NULL),

('dust2', 'Flash Upper B Tunnels', 'flash', 't', 'Lower B Tunnels',
 'Upper B Tunnels',
 'Flash pop ao dobrar a esquina para cegar CTs no B Site.',
 NULL, NULL, NULL),

('dust2', 'Molotov B Car', 'molotov', 'ct', 'B Site',
 'B Car',
 'Molotov no carro B para limpar posição durante retake.',
 NULL, NULL, NULL),

-- ============================================================
-- ANCIENT
-- ============================================================

('ancient', 'Smoke CT A Site', 'smoke', 't', 'A Main',
 'CT A Site',
 'Fecha o CT durante executa no A.',
 NULL, NULL, NULL),

('ancient', 'Smoke Pillar A', 'smoke', 't', 'A Main',
 'Pillar A',
 'Fecha o ângulo do Pillar A durante executa.',
 NULL, NULL, NULL),

('ancient', 'Flash B Site', 'flash', 't', 'Mid',
 'B Site',
 'Flash pop para entrada no B vindo pelo Mid.',
 NULL, NULL, NULL),

-- ============================================================
-- NUKE
-- ============================================================

('nuke', 'Smoke Ramp Upper', 'smoke', 't', 'T Spawn',
 'Ramp Upper',
 'Fecha o Ramp para executa no Upper.',
 NULL, NULL, NULL),

('nuke', 'Smoke Heaven Upper', 'smoke', 'ct', 'Upper A',
 'Heaven',
 'Fecha o Heaven durante retake no Upper.',
 NULL, NULL, NULL),

('nuke', 'Molotov Silo', 'molotov', 'ct', 'Upper A',
 'Silo',
 'Molotov no Silo para limpar posição T.',
 NULL, NULL, NULL),

-- ============================================================
-- ANUBIS
-- ============================================================

('anubis', 'Smoke CT A Site', 'smoke', 't', 'A Main',
 'CT A Site',
 'Smoke padrão para executa no A.',
 NULL, NULL, NULL),

('anubis', 'Smoke B Mid', 'smoke', 't', 'Mid',
 'B Mid',
 'Fecha o Mid para split no B.',
 NULL, NULL, NULL);
