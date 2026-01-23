-- =====================================================
-- DADOS FICTÍCIOS REALISTAS - DOMMUS SMART HOME CRM
-- Execute este script no Supabase SQL Editor
-- =====================================================

-- Primeiro, limpar dados existentes (opcional - descomente se necessário)
-- DELETE FROM quote_items;
-- DELETE FROM quotes;
-- DELETE FROM projects;
-- DELETE FROM catalog_products;
-- DELETE FROM clients;
-- DELETE FROM leads;
-- DELETE FROM instagram_posts;

-- =====================================================
-- 1. CLIENTES
-- =====================================================
INSERT INTO clients (id, name, company, email, phone, secondary_phone, cpf_cnpj, address, city, state, zip_code, status, type, source, notes)
VALUES
  (gen_random_uuid(), 'Roberto Mendes', NULL, 'roberto.mendes@gmail.com', '(47) 99912-3456', '(47) 3333-4567', '123.456.789-00', 'Rua das Palmeiras, 245, Jardim Europa', 'Blumenau', 'SC', '89012-000', 'Ativo', 'Pessoa Física', 'Indicação', 'Cliente interessado em automação completa da residência. Preferência por sistema Apple HomeKit.'),
  (gen_random_uuid(), 'Marina Costa Silva', 'Costa Arquitetura', 'marina@costaarquitetura.com.br', '(47) 99887-6543', NULL, '12.345.678/0001-90', 'Av. Brasil, 1500, Sala 802, Centro', 'Joinville', 'SC', '89201-000', 'Ativo', 'Pessoa Jurídica', 'Site', 'Arquiteta parceira. Indica projetos de alto padrão.'),
  (gen_random_uuid(), 'Dr. Paulo Andrade', 'Clínica Andrade', 'paulo@clinicaandrade.med.br', '(47) 99765-4321', '(47) 3365-8900', '98.765.432/0001-10', 'Rua XV de Novembro, 890, Vila Nova', 'Blumenau', 'SC', '89010-000', 'Ativo', 'Pessoa Jurídica', 'Instagram', 'Médico, quer automação no consultório e na residência.'),
  (gen_random_uuid(), 'Fernanda e Ricardo Keller', NULL, 'familia.keller@hotmail.com', '(47) 99654-3210', NULL, '234.567.890-11', 'Rua dos Ipês, 78, Bairro Garcia', 'Blumenau', 'SC', '89020-000', 'Ativo', 'Pessoa Física', 'Indicação', 'Casal jovem construindo casa nova. Orçamento de R$ 150k para automação.'),
  (gen_random_uuid(), 'Hotel Blumenau Palace', 'Rede Blumenau Hotels', 'gerencia@blumenaupalace.com.br', '(47) 3326-5000', '(47) 3326-5001', '11.222.333/0001-44', 'Rua 7 de Setembro, 1000, Centro', 'Blumenau', 'SC', '89010-100', 'Prospecto', 'Pessoa Jurídica', 'Feira', 'Interesse em automação dos 80 apartamentos. Projeto de grande porte.'),
  (gen_random_uuid(), 'Carla Beatriz Fontana', NULL, 'carla.fontana@outlook.com', '(47) 99543-2109', NULL, '345.678.901-22', 'Av. República Argentina, 567, Velha', 'Blumenau', 'SC', '89036-000', 'Ativo', 'Pessoa Física', 'Google', 'Interesse em home theater de alto padrão. Budget: R$ 80k.'),
  (gen_random_uuid(), 'Restaurante Villa Toscana', 'Villa Toscana Gastronomia Ltda', 'contato@villatoscana.com.br', '(47) 3322-7788', NULL, '22.333.444/0001-55', 'Rua Hermann Hering, 200, Bom Retiro', 'Blumenau', 'SC', '89010-500', 'Em Negociação', 'Pessoa Jurídica', 'Indicação', 'Quer sistema de som ambiente e automação de iluminação no salão.'),
  (gen_random_uuid(), 'Thiago Nascimento', 'TN Investimentos', 'thiago@tninvest.com.br', '(47) 99432-1098', '(47) 3333-9900', '456.789.012-33', 'Rua Itajaí, 456, Ponta Aguda', 'Blumenau', 'SC', '89050-000', 'Ativo', 'Pessoa Física', 'LinkedIn', 'Empresário, 3 imóveis para automatizar. Cliente de alto valor.');

-- =====================================================
-- 2. LEADS
-- =====================================================
INSERT INTO leads (id, name, company, email, phone, source, status, notes, position, address, website)
VALUES
  (gen_random_uuid(), 'Lucas Ferreira', 'Ferreira Engenharia', 'lucas@ferreiraeng.com.br', '(47) 99876-5432', 'Instagram', 'Novo', 'Viu nosso projeto do home theater e quer orçamento similar.', 'Engenheiro Civil', 'Rua das Acácias, 123, Itoupava Norte', 'www.ferreiraeng.com.br'),
  (gen_random_uuid(), 'Amanda Cristina Souza', NULL, 'amanda.souza@gmail.com', '(47) 99765-4321', 'Site', 'Qualificado', 'Reformando apartamento 3 quartos. Interesse em iluminação inteligente e persianas.', 'Designer de Interiores', 'Av. Beira Rio, 890, Centro', NULL),
  (gen_random_uuid(), 'Eduardo Martins', 'EM Advocacia', 'eduardo@emadvocacia.com.br', '(47) 99654-3210', 'Indicação', 'Em Contato', 'Indicado pelo Dr. Paulo. Quer automação no escritório de advocacia.', 'Advogado', 'Rua Nereu Ramos, 300, Centro', 'www.emadvocacia.com.br'),
  (gen_random_uuid(), 'Juliana Prado', 'Academia FitLife', 'juliana@fitlife.com.br', '(47) 99543-2109', 'Google', 'Proposta', 'Quer sistema de som e TVs para a academia. 500m².', 'Proprietária', 'Rua São Paulo, 1200, Victor Konder', 'www.fitlifeblumenau.com.br'),
  (gen_random_uuid(), 'Marcos Vinícius Lima', NULL, 'marcoslima@hotmail.com', '(47) 99432-1098', 'Facebook', 'Novo', 'Interesse em câmeras de segurança e fechaduras inteligentes.', NULL, 'Rua Bahia, 678, Garcia', NULL),
  (gen_random_uuid(), 'Patrícia Oliveira', 'Oliveira Imóveis', 'patricia@oliveiraimoveis.com.br', '(47) 99321-0987', 'Feira', 'Qualificado', 'Corretora interessada em parceria para decorados de empreendimentos.', 'Corretora', 'Av. Brasil, 2000, Centro', 'www.oliveiraimoveis.com.br'),
  (gen_random_uuid(), 'Rafael Santos', 'Tech Solutions SC', 'rafael@techsolutions.sc', '(47) 99210-9876', 'LinkedIn', 'Em Contato', 'CEO de empresa de TI. Quer automação residencial completa.', 'CEO', 'Rua das Missões, 456, Itoupava Seca', 'www.techsolutions.sc'),
  (gen_random_uuid(), 'Cristiane Almeida', NULL, 'cris.almeida@gmail.com', '(47) 99109-8765', 'Instagram', 'Perdido', 'Interesse inicial em home theater mas achou muito caro.', 'Empresária', NULL, NULL),
  (gen_random_uuid(), 'Bruno Costa', 'Costa & Costa Contabilidade', 'bruno@costaconta.com.br', '(47) 99098-7654', 'Indicação', 'Convertido', 'Convertido em cliente. Projeto de escritório contábil concluído.', 'Contador', 'Rua Amazonas, 789, Ponta Aguda', 'www.costaconta.com.br'),
  (gen_random_uuid(), 'Isabela Fernandes', 'Salão Bella Donna', 'isabela@belladonna.com.br', '(47) 99987-6543', 'Site', 'Em Contato', 'Quer iluminação especial para o salão de beleza.', 'Proprietária', 'Rua Sete de Setembro, 450, Centro', 'www.belladonnasc.com.br');

-- =====================================================
-- 3. CATÁLOGO DE PRODUTOS
-- =====================================================
INSERT INTO catalog_products (id, name, description, sku, brand, category, subcategory, cost_price, sale_price, suggested_markup, image_url, supplier, in_stock, stock_quantity, is_active)
VALUES
  -- Automação
  (gen_random_uuid(), 'Controlador Central HDL Buspro', 'Controlador central para sistema de automação HDL. Suporta até 64 zonas.', 'HDL-CTRL-001', 'HDL', 'Automação', 'Controladores', 2800.00, 4500.00, 60.7, 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400', 'Interlight Automação', true, 5, true),
  (gen_random_uuid(), 'Módulo Dimmer 4 Canais HDL', 'Módulo dimmer para controle de 4 canais de iluminação.', 'HDL-DIM-004', 'HDL', 'Automação', 'Módulos', 890.00, 1350.00, 51.7, 'https://images.unsplash.com/photo-1558089687-f282ffcbc126?w=400', 'Interlight Automação', true, 12, true),
  (gen_random_uuid(), 'Módulo Relé 8 Canais HDL', 'Módulo relé para controle de 8 cargas on/off.', 'HDL-REL-008', 'HDL', 'Automação', 'Módulos', 750.00, 1150.00, 53.3, 'https://images.unsplash.com/photo-1558089687-f282ffcbc126?w=400', 'Interlight Automação', true, 8, true),
  (gen_random_uuid(), 'Keypad Touch 6 Botões HDL', 'Painel touch elegante com 6 botões programáveis.', 'HDL-KEY-006', 'HDL', 'Automação', 'Interfaces', 680.00, 1050.00, 54.4, 'https://images.unsplash.com/photo-1558089687-f282ffcbc126?w=400', 'Interlight Automação', true, 15, true),
  (gen_random_uuid(), 'Sensor de Presença PIR HDL', 'Sensor de presença para automação de iluminação.', 'HDL-PIR-001', 'HDL', 'Automação', 'Sensores', 280.00, 450.00, 60.7, 'https://images.unsplash.com/photo-1558089687-f282ffcbc126?w=400', 'Interlight Automação', true, 20, true),

  -- Iluminação
  (gen_random_uuid(), 'Spot LED Embutir 7W Stella', 'Spot LED embutir, 7W, 3000K, branco.', 'STE-SPT-007', 'Stella', 'Iluminação', 'Spots', 45.00, 75.00, 66.7, 'https://images.unsplash.com/photo-1565814636199-ae8133055c1c?w=400', 'Lumini Distribuidora', true, 100, true),
  (gen_random_uuid(), 'Fita LED RGB 5m Stella', 'Fita LED RGB 5 metros, controle por app.', 'STE-FIT-RGB5', 'Stella', 'Iluminação', 'Fitas LED', 180.00, 290.00, 61.1, 'https://images.unsplash.com/photo-1565814636199-ae8133055c1c?w=400', 'Lumini Distribuidora', true, 25, true),
  (gen_random_uuid(), 'Driver LED Dimerizável 100W', 'Fonte dimerizável para fitas LED, 100W.', 'STE-DRV-100', 'Stella', 'Iluminação', 'Drivers', 320.00, 490.00, 53.1, 'https://images.unsplash.com/photo-1565814636199-ae8133055c1c?w=400', 'Lumini Distribuidora', true, 15, true),
  (gen_random_uuid(), 'Lâmpada Inteligente WiFi 9W', 'Lâmpada inteligente, WiFi, RGB + branco, compatível Alexa/Google.', 'STE-LMP-W9', 'Stella', 'Iluminação', 'Lâmpadas', 65.00, 110.00, 69.2, 'https://images.unsplash.com/photo-1565814636199-ae8133055c1c?w=400', 'Lumini Distribuidora', true, 50, true),

  -- Áudio
  (gen_random_uuid(), 'Caixa de Embutir 6" Bose', 'Caixa acústica de embutir, 6 polegadas, 80W.', 'BOS-EMB-006', 'Bose', 'Áudio', 'Caixas', 1200.00, 1890.00, 57.5, 'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=400', 'Audio Prime Brasil', true, 20, true),
  (gen_random_uuid(), 'Amplificador Multizona 4ch Denon', 'Amplificador 4 zonas independentes, streaming integrado.', 'DEN-AMP-4Z', 'Denon', 'Áudio', 'Amplificadores', 4500.00, 6800.00, 51.1, 'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=400', 'Audio Prime Brasil', true, 3, true),
  (gen_random_uuid(), 'Soundbar Samsung HW-Q990D', 'Soundbar premium 11.1.4 canais, Dolby Atmos.', 'SAM-SND-990D', 'Samsung', 'Áudio', 'Soundbars', 5200.00, 7500.00, 44.2, 'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=400', 'Samsung Store', true, 2, true),
  (gen_random_uuid(), 'Subwoofer Ativo 12" Klipsch', 'Subwoofer ativo 12 polegadas, 400W RMS.', 'KLP-SUB-12', 'Klipsch', 'Áudio', 'Subwoofers', 3800.00, 5500.00, 44.7, 'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=400', 'Audio Prime Brasil', true, 4, true),

  -- Vídeo / Home Theater
  (gen_random_uuid(), 'TV Samsung 75" Neo QLED 8K', 'Smart TV 75 polegadas, Neo QLED 8K, 120Hz.', 'SAM-TV-75Q8K', 'Samsung', 'Vídeo', 'TVs', 18000.00, 24900.00, 38.3, 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=400', 'Samsung Store', true, 2, true),
  (gen_random_uuid(), 'Projetor Epson Home Cinema 5050UB', 'Projetor 4K PRO-UHD, 2600 lumens, HDR10.', 'EPS-PRJ-5050', 'Epson', 'Home Theater', 'Projetores', 12000.00, 16500.00, 37.5, 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=400', 'Epson Brasil', true, 1, true),
  (gen_random_uuid(), 'Tela Motorizada 120" 16:9', 'Tela de projeção motorizada, 120 polegadas, ganho 1.0.', 'GEN-TLA-120', 'Screen Excellence', 'Home Theater', 'Telas', 3500.00, 5200.00, 48.6, 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=400', 'Projeção Brasil', true, 3, true),
  (gen_random_uuid(), 'Receiver Denon AVR-X6800H', 'Receiver AV 11.4 canais, Dolby Atmos, HDMI 2.1.', 'DEN-RCV-X6800', 'Denon', 'Home Theater', 'Receivers', 9800.00, 13500.00, 37.8, 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=400', 'Audio Prime Brasil', true, 2, true),

  -- Climatização
  (gen_random_uuid(), 'Ar Condicionado Inverter 12000 BTUs', 'Split inverter, WiFi, compatível com automação.', 'SAM-AC-12INV', 'Samsung', 'Climatização', 'Ar Condicionado', 2800.00, 4200.00, 50.0, 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=400', 'Samsung Store', true, 8, true),
  (gen_random_uuid(), 'Módulo IR Universal HDL', 'Módulo infravermelho para controle de ar condicionado.', 'HDL-IR-001', 'HDL', 'Climatização', 'Módulos IR', 380.00, 580.00, 52.6, 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=400', 'Interlight Automação', true, 20, true),
  (gen_random_uuid(), 'Termostato Inteligente Nest', 'Termostato aprendizado automático, WiFi.', 'NST-TRM-001', 'Google Nest', 'Climatização', 'Termostatos', 1100.00, 1650.00, 50.0, 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=400', 'Google Store', true, 6, true),

  -- Segurança
  (gen_random_uuid(), 'Fechadura Digital Yale YMF 40', 'Fechadura biométrica + senha + cartão.', 'YAL-FEC-40', 'Yale', 'Segurança', 'Fechaduras', 1800.00, 2650.00, 47.2, 'https://images.unsplash.com/photo-1558002038-1055907df827?w=400', 'Yale Brasil', true, 10, true),
  (gen_random_uuid(), 'Câmera IP Dome 4MP Hikvision', 'Câmera dome IP, 4MP, IR 30m, PoE.', 'HIK-CAM-4D', 'Hikvision', 'Segurança', 'Câmeras', 450.00, 720.00, 60.0, 'https://images.unsplash.com/photo-1558002038-1055907df827?w=400', 'Hikvision BR', true, 30, true),
  (gen_random_uuid(), 'Videoporteiro IP Hikvision', 'Videoporteiro IP com app mobile.', 'HIK-VPT-001', 'Hikvision', 'Segurança', 'Videoporteiros', 1200.00, 1850.00, 54.2, 'https://images.unsplash.com/photo-1558002038-1055907df827?w=400', 'Hikvision BR', true, 5, true),
  (gen_random_uuid(), 'DVR 8 Canais Hikvision', 'DVR 8 canais, 4MP, 2TB HDD incluso.', 'HIK-DVR-8CH', 'Hikvision', 'Segurança', 'DVRs/NVRs', 1600.00, 2400.00, 50.0, 'https://images.unsplash.com/photo-1558002038-1055907df827?w=400', 'Hikvision BR', true, 8, true),

  -- Cortinas
  (gen_random_uuid(), 'Motor Cortina Somfy Sonesse', 'Motor silencioso para cortinas, até 6kg.', 'SOM-MOT-SON', 'Somfy', 'Cortinas', 'Motores', 850.00, 1300.00, 52.9, 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=400', 'Somfy Brasil', true, 15, true),
  (gen_random_uuid(), 'Controlador Somfy TaHoma', 'Central de automação Somfy, WiFi.', 'SOM-TAH-001', 'Somfy', 'Cortinas', 'Centrais', 1100.00, 1700.00, 54.5, 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=400', 'Somfy Brasil', true, 4, true),

  -- Infraestrutura
  (gen_random_uuid(), 'Switch PoE 8 Portas Ubiquiti', 'Switch gerenciável 8 portas PoE, 60W.', 'UBQ-SW-8POE', 'Ubiquiti', 'Infraestrutura', 'Switches', 980.00, 1500.00, 53.1, 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=400', 'Ubiquiti Store', true, 10, true),
  (gen_random_uuid(), 'Access Point Ubiquiti UniFi 6', 'Access point WiFi 6, PoE.', 'UBQ-AP-U6', 'Ubiquiti', 'Infraestrutura', 'WiFi', 890.00, 1350.00, 51.7, 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=400', 'Ubiquiti Store', true, 12, true),
  (gen_random_uuid(), 'Rack de Parede 6U', 'Rack de parede 6U, 19 polegadas.', 'GEN-RCK-6U', 'Genérico', 'Infraestrutura', 'Racks', 280.00, 450.00, 60.7, 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=400', 'Tech Supply', true, 8, true),
  (gen_random_uuid(), 'Cabo HDMI 2.1 10m', 'Cabo HDMI 2.1, 8K, 10 metros.', 'GEN-HDM-10', 'AudioQuest', 'Infraestrutura', 'Cabos', 280.00, 420.00, 50.0, 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=400', 'Audio Prime Brasil', true, 25, true);

-- =====================================================
-- 4. AGENTES (Vendedores)
-- =====================================================
INSERT INTO agents (id, name, email, phone, position, status, photo_url)
VALUES
  (gen_random_uuid(), 'Carlos Eduardo Müller', 'carlos@dommus.com.br', '(47) 99999-0001', 'Consultor Sênior', 'active', NULL),
  (gen_random_uuid(), 'Ana Paula Ritter', 'ana@dommus.com.br', '(47) 99999-0002', 'Consultora', 'active', NULL),
  (gen_random_uuid(), 'Felipe Augusto Schmidt', 'felipe@dommus.com.br', '(47) 99999-0003', 'Consultor Técnico', 'active', NULL);

-- =====================================================
-- 5. PROJETOS (serão vinculados aos clientes existentes)
-- Execute após inserir os clientes acima
-- =====================================================
-- Nota: Os IDs dos clientes serão gerados automaticamente.
-- Este script usa uma subconsulta para buscar os IDs.

DO $$
DECLARE
  v_client_roberto UUID;
  v_client_marina UUID;
  v_client_paulo UUID;
  v_client_keller UUID;
  v_client_carla UUID;
  v_client_villa UUID;
  v_client_thiago UUID;
  v_agent_carlos UUID;
  v_agent_ana UUID;
  v_agent_felipe UUID;
BEGIN
  -- Buscar IDs dos clientes
  SELECT id INTO v_client_roberto FROM clients WHERE email = 'roberto.mendes@gmail.com' LIMIT 1;
  SELECT id INTO v_client_marina FROM clients WHERE email = 'marina@costaarquitetura.com.br' LIMIT 1;
  SELECT id INTO v_client_paulo FROM clients WHERE email = 'paulo@clinicaandrade.med.br' LIMIT 1;
  SELECT id INTO v_client_keller FROM clients WHERE email = 'familia.keller@hotmail.com' LIMIT 1;
  SELECT id INTO v_client_carla FROM clients WHERE email = 'carla.fontana@outlook.com' LIMIT 1;
  SELECT id INTO v_client_villa FROM clients WHERE email = 'contato@villatoscana.com.br' LIMIT 1;
  SELECT id INTO v_client_thiago FROM clients WHERE email = 'thiago@tninvest.com.br' LIMIT 1;

  -- Buscar IDs dos agentes
  SELECT id INTO v_agent_carlos FROM agents WHERE email = 'carlos@dommus.com.br' LIMIT 1;
  SELECT id INTO v_agent_ana FROM agents WHERE email = 'ana@dommus.com.br' LIMIT 1;
  SELECT id INTO v_agent_felipe FROM agents WHERE email = 'felipe@dommus.com.br' LIMIT 1;

  -- Inserir projetos
  IF v_client_roberto IS NOT NULL THEN
    INSERT INTO projects (id, name, description, client_id, status, type, estimated_value, start_date, estimated_end_date, address, city, state, agent_id, notes)
    VALUES (gen_random_uuid(), 'Casa Mendes - Automação Completa', 'Projeto de automação residencial completa: iluminação, áudio multizona, climatização, segurança e home theater.', v_client_roberto, 'Em Execução', 'Residencial', 185000.00, '2024-01-15', '2024-04-30', 'Rua das Palmeiras, 245', 'Blumenau', 'SC', v_agent_carlos, 'Cliente premium, preferência por equipamentos Apple HomeKit. Acompanhamento semanal.');
  END IF;

  IF v_client_paulo IS NOT NULL THEN
    INSERT INTO projects (id, name, description, client_id, status, type, estimated_value, start_date, estimated_end_date, address, city, state, agent_id, notes)
    VALUES (gen_random_uuid(), 'Clínica Andrade - Automação', 'Automação do consultório médico: iluminação, climatização e áudio ambiente nas salas de espera.', v_client_paulo, 'Aprovado', 'Comercial', 45000.00, '2024-02-01', '2024-03-15', 'Rua XV de Novembro, 890', 'Blumenau', 'SC', v_agent_ana, 'Projeto em parceria com arquiteta Marina Costa.');
  END IF;

  IF v_client_keller IS NOT NULL THEN
    INSERT INTO projects (id, name, description, client_id, status, type, estimated_value, start_date, estimated_end_date, address, city, state, agent_id, notes)
    VALUES (gen_random_uuid(), 'Residência Keller - Casa Nova', 'Casa em construção. Projeto completo de automação residencial. Iluminação, persianas, áudio, segurança.', v_client_keller, 'Orçamento', 'Residencial', 150000.00, NULL, NULL, 'Rua dos Ipês, 78', 'Blumenau', 'SC', v_agent_carlos, 'Casa em construção, previsão de término da obra em abril. Aguardando aprovação do orçamento.');
  END IF;

  IF v_client_carla IS NOT NULL THEN
    INSERT INTO projects (id, name, description, client_id, status, type, estimated_value, start_date, estimated_end_date, address, city, state, agent_id, notes)
    VALUES (gen_random_uuid(), 'Home Theater Fontana', 'Sala de home theater dedicada 7.2.4. Projetor 4K, tela 120", tratamento acústico, automação de iluminação.', v_client_carla, 'Instalação', 'Residencial', 82000.00, '2024-01-08', '2024-02-20', 'Av. República Argentina, 567', 'Blumenau', 'SC', v_agent_felipe, 'Instalação em andamento. Tratamento acústico concluído, aguardando equipamentos.');
  END IF;

  IF v_client_villa IS NOT NULL THEN
    INSERT INTO projects (id, name, description, client_id, status, type, estimated_value, start_date, estimated_end_date, address, city, state, agent_id, notes)
    VALUES (gen_random_uuid(), 'Villa Toscana - Som Ambiente', 'Sistema de som ambiente para restaurante: 8 zonas, controle centralizado, playlist automatizada.', v_client_villa, 'Em Execução', 'Comercial', 38000.00, '2024-01-20', '2024-02-28', 'Rua Hermann Hering, 200', 'Blumenau', 'SC', v_agent_ana, 'Instalação fora do horário de funcionamento. Sábados e domingos.');
  END IF;

  IF v_client_thiago IS NOT NULL THEN
    INSERT INTO projects (id, name, description, client_id, status, type, estimated_value, start_date, estimated_end_date, address, city, state, agent_id, notes)
    VALUES
    (gen_random_uuid(), 'Cobertura Ponta Aguda - Thiago', 'Cobertura duplex com automação completa. 6 ambientes, home theater, piscina aquecida automatizada.', v_client_thiago, 'Finalizado', 'Residencial', 220000.00, '2023-08-01', '2023-12-15', 'Rua Itajaí, 456, Cobertura', 'Blumenau', 'SC', v_agent_carlos, 'Projeto concluído. Cliente muito satisfeito. Indicou 2 novos clientes.'),
    (gen_random_uuid(), 'Apartamento Itapema - Thiago', 'Apartamento de praia. Automação básica: iluminação, persianas e climatização.', v_client_thiago, 'Aprovado', 'Residencial', 35000.00, '2024-03-01', '2024-04-15', 'Av. Atlântica, 1200, Apto 801', 'Itapema', 'SC', v_agent_ana, 'Segundo imóvel do cliente. Projeto mais simples.');
  END IF;
END $$;

-- =====================================================
-- 6. ORÇAMENTOS
-- =====================================================
DO $$
DECLARE
  v_project_keller UUID;
  v_project_fontana UUID;
  v_client_keller UUID;
  v_client_carla UUID;
  v_agent_carlos UUID;
  v_agent_felipe UUID;
  v_quote_keller UUID;
  v_quote_fontana UUID;
BEGIN
  -- Buscar IDs
  SELECT id INTO v_client_keller FROM clients WHERE email = 'familia.keller@hotmail.com' LIMIT 1;
  SELECT id INTO v_client_carla FROM clients WHERE email = 'carla.fontana@outlook.com' LIMIT 1;
  SELECT p.id INTO v_project_keller FROM projects p JOIN clients c ON p.client_id = c.id WHERE c.email = 'familia.keller@hotmail.com' LIMIT 1;
  SELECT p.id INTO v_project_fontana FROM projects p JOIN clients c ON p.client_id = c.id WHERE c.email = 'carla.fontana@outlook.com' LIMIT 1;
  SELECT id INTO v_agent_carlos FROM agents WHERE email = 'carlos@dommus.com.br' LIMIT 1;
  SELECT id INTO v_agent_felipe FROM agents WHERE email = 'felipe@dommus.com.br' LIMIT 1;

  -- Criar orçamentos
  IF v_client_keller IS NOT NULL THEN
    v_quote_keller := gen_random_uuid();
    INSERT INTO quotes (id, number, project_id, client_id, status, valid_until, subtotal, discount, discount_type, labor_cost, installation_cost, total_value, notes, terms, payment_conditions, agent_id)
    VALUES (v_quote_keller, 'ORC-2024-001', v_project_keller, v_client_keller, 'Enviado', '2024-02-28', 128500.00, 5.0, 'percentage', 15000.00, 8000.00, 145075.00, 'Orçamento completo para automação residencial.', 'Garantia de 2 anos em todos os equipamentos. Suporte técnico por 1 ano.', '50% entrada, 30% na entrega dos equipamentos, 20% na conclusão.', v_agent_carlos);
  END IF;

  IF v_client_carla IS NOT NULL THEN
    v_quote_fontana := gen_random_uuid();
    INSERT INTO quotes (id, number, project_id, client_id, status, valid_until, subtotal, discount, discount_type, labor_cost, installation_cost, total_value, notes, terms, payment_conditions, agent_id, approved_at)
    VALUES (v_quote_fontana, 'ORC-2024-002', v_project_fontana, v_client_carla, 'Aprovado', '2024-02-15', 68500.00, 3000.00, 'fixed', 8000.00, 5500.00, 79000.00, 'Home theater sala dedicada 7.2.4 canais.', 'Garantia de 2 anos. Inclui calibração profissional.', '40% entrada, 40% na entrega, 20% após calibração.', v_agent_felipe, NOW());
  END IF;
END $$;

-- =====================================================
-- 7. POSTS INSTAGRAM
-- =====================================================
INSERT INTO instagram_posts (id, instagram_url, image_url, video_url, caption, type, category, is_active, display_order, show_in_sections)
VALUES
  (gen_random_uuid(), 'https://www.instagram.com/p/example1/', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800', NULL, 'Projeto Home Theater completo em Blumenau. 7.2.4 canais de pura imersão cinematográfica! #hometheater #automacao #dommus', 'image', 'Home Theater', true, 0, ARRAY['feed', 'projects']),
  (gen_random_uuid(), 'https://www.instagram.com/p/example2/', 'https://images.unsplash.com/photo-1558089687-f282ffcbc126?w=800', NULL, 'Painel de automação HDL integrado com Apple HomeKit. Controle toda sua casa na ponta dos dedos! #smarthome #automacao #hdl', 'image', 'Automação', true, 1, ARRAY['feed', 'hero']),
  (gen_random_uuid(), 'https://www.instagram.com/p/example3/', 'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800', NULL, 'Sistema de som multizona Bose para residência em Pomerode. 6 ambientes com áudio independente. #bose #audiomultizona #somambiente', 'image', 'Áudio', true, 2, ARRAY['feed', 'projects']),
  (gen_random_uuid(), 'https://www.instagram.com/p/example4/', 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800', NULL, 'Cortinas motorizadas Somfy integradas com a automação. Abrem automaticamente ao amanhecer! #somfy #cortinas #automacao', 'image', 'Automação', true, 3, ARRAY['feed']),
  (gen_random_uuid(), 'https://www.instagram.com/p/example5/', 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=800', NULL, 'TV Samsung 85" Neo QLED instalada em sala de estar. Design limpo, cabos invisíveis! #samsung #instalacao #tv', 'image', 'Residencial', true, 4, ARRAY['feed', 'projects']),
  (gen_random_uuid(), 'https://www.instagram.com/p/example6/', 'https://images.unsplash.com/photo-1558002038-1055907df827?w=800', NULL, 'Sistema de segurança integrado: câmeras IP 4K, videoporteiro e fechaduras biométricas Yale. #seguranca #yale #hikvision', 'image', 'Automação', true, 5, ARRAY['feed']),
  (gen_random_uuid(), 'https://www.instagram.com/p/example7/', NULL, 'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4', 'Veja como funciona o controle de iluminação por cenas! Um toque e o ambiente se transforma. #iluminacao #automacao #dommus', 'video', 'Automação', true, 6, ARRAY['feed', 'hero']),
  (gen_random_uuid(), 'https://www.instagram.com/p/example8/', 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800', NULL, 'Projeto corporativo em Joinville. Sala de reuniões com videoconferência e automação completa. #corporativo #salareuniao #automacao', 'image', 'Corporativo', true, 7, ARRAY['feed', 'projects']);

-- =====================================================
-- FIM DO SCRIPT
-- =====================================================
SELECT 'Dados fictícios inseridos com sucesso!' AS resultado;
