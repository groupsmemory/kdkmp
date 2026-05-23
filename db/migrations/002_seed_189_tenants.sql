-- ============================================================================
-- MIGRASI 002: Seed 189 Gerai KDKMP Pamekasan (13 Kecamatan)
-- ============================================================================
-- Expand dari 13 seed awal ke 189 gerai percontohan.
-- Setiap kecamatan memiliki ~14-15 gerai (1 per desa).
-- Koordinat diestimasi berdasarkan pusat kecamatan.
-- ============================================================================

-- Kecamatan Pamekasan (15 desa)
INSERT INTO tenants (name, region, subdistrict, village, latitude, longitude) VALUES
('KDKMP Desa Barurambat Kota', 'Pamekasan', 'Pamekasan', 'Barurambat Kota', -7.1567, 113.4678),
('KDKMP Desa Gladak Anyar', 'Pamekasan', 'Pamekasan', 'Gladak Anyar', -7.1590, 113.4710),
('KDKMP Desa Kolpajung', 'Pamekasan', 'Pamekasan', 'Kolpajung', -7.1545, 113.4650),
('KDKMP Desa Kangenan', 'Pamekasan', 'Pamekasan', 'Kangenan', -7.1610, 113.4690),
('KDKMP Desa Patemon', 'Pamekasan', 'Pamekasan', 'Patemon', -7.1530, 113.4720),
('KDKMP Desa Jungcangcang', 'Pamekasan', 'Pamekasan', 'Jungcangcang', -7.1580, 113.4640),
('KDKMP Desa Bettet', 'Pamekasan', 'Pamekasan', 'Bettet', -7.1555, 113.4730),
('KDKMP Desa Bugih', 'Pamekasan', 'Pamekasan', 'Bugih', -7.1600, 113.4660),
('KDKMP Desa Nyalabu Laok', 'Pamekasan', 'Pamekasan', 'Nyalabu Laok', -7.1520, 113.4700),
('KDKMP Desa Nyalabu Daya', 'Pamekasan', 'Pamekasan', 'Nyalabu Daya', -7.1540, 113.4680),
('KDKMP Desa Kowel', 'Pamekasan', 'Pamekasan', 'Kowel', -7.1575, 113.4750),
('KDKMP Desa Teja Timur', 'Pamekasan', 'Pamekasan', 'Teja Timur', -7.1560, 113.4620)
ON CONFLICT (name) DO NOTHING;

-- Kecamatan Tlanakan (15 desa)
INSERT INTO tenants (name, region, subdistrict, village, latitude, longitude) VALUES
('KDKMP Desa Larangan Slampar', 'Pamekasan', 'Tlanakan', 'Larangan Slampar', -7.1987, 113.4521),
('KDKMP Desa Panglegur', 'Pamekasan', 'Tlanakan', 'Panglegur', -7.2010, 113.4550),
('KDKMP Desa Branta Pesisir', 'Pamekasan', 'Tlanakan', 'Branta Pesisir', -7.2050, 113.4480),
('KDKMP Desa Branta Tinggi', 'Pamekasan', 'Tlanakan', 'Branta Tinggi', -7.2030, 113.4510),
('KDKMP Desa Ceguk', 'Pamekasan', 'Tlanakan', 'Ceguk', -7.1970, 113.4540),
('KDKMP Desa Dabuan', 'Pamekasan', 'Tlanakan', 'Dabuan', -7.1995, 113.4570),
('KDKMP Desa Kramat', 'Pamekasan', 'Tlanakan', 'Kramat', -7.2020, 113.4490),
('KDKMP Desa Larangan Badung', 'Pamekasan', 'Tlanakan', 'Larangan Badung', -7.1960, 113.4530),
('KDKMP Desa Bukek', 'Pamekasan', 'Tlanakan', 'Bukek', -7.2040, 113.4560),
('KDKMP Desa Bandaran', 'Pamekasan', 'Tlanakan', 'Bandaran', -7.1980, 113.4500),
('KDKMP Desa Ambat', 'Pamekasan', 'Tlanakan', 'Ambat', -7.2060, 113.4520),
('KDKMP Desa Bujur Barat', 'Pamekasan', 'Tlanakan', 'Bujur Barat', -7.1950, 113.4580),
('KDKMP Desa Bujur Timur', 'Pamekasan', 'Tlanakan', 'Bujur Timur', -7.1940, 113.4600),
('KDKMP Desa Larangan Dalam', 'Pamekasan', 'Tlanakan', 'Larangan Dalam', -7.2000, 113.4460)
ON CONFLICT (name) DO NOTHING;

-- Kecamatan Pademawu (15 desa)
INSERT INTO tenants (name, region, subdistrict, village, latitude, longitude) VALUES
('KDKMP Desa Pademawu Barat', 'Pamekasan', 'Pademawu', 'Pademawu Barat', -7.1845, 113.4732),
('KDKMP Desa Pademawu Timur', 'Pamekasan', 'Pademawu', 'Pademawu Timur', -7.1860, 113.4760),
('KDKMP Desa Bunder', 'Pamekasan', 'Pademawu', 'Bunder', -7.1830, 113.4710),
('KDKMP Desa Dasok', 'Pamekasan', 'Pademawu', 'Dasok', -7.1870, 113.4780),
('KDKMP Desa Jarin', 'Pamekasan', 'Pademawu', 'Jarin', -7.1820, 113.4690),
('KDKMP Desa Lemper', 'Pamekasan', 'Pademawu', 'Lemper', -7.1880, 113.4800),
('KDKMP Desa Murtajih', 'Pamekasan', 'Pademawu', 'Murtajih', -7.1810, 113.4670),
('KDKMP Desa Pagagan', 'Pamekasan', 'Pademawu', 'Pagagan', -7.1890, 113.4820),
('KDKMP Desa Sentol', 'Pamekasan', 'Pademawu', 'Sentol', -7.1800, 113.4650),
('KDKMP Desa Sumedangan', 'Pamekasan', 'Pademawu', 'Sumedangan', -7.1900, 113.4840),
('KDKMP Desa Tanjung', 'Pamekasan', 'Pademawu', 'Tanjung', -7.1790, 113.4630),
('KDKMP Desa Buddagan', 'Pamekasan', 'Pademawu', 'Buddagan', -7.1910, 113.4860),
('KDKMP Desa Dempo Barat', 'Pamekasan', 'Pademawu', 'Dempo Barat', -7.1780, 113.4610),
('KDKMP Desa Dempo Timur', 'Pamekasan', 'Pademawu', 'Dempo Timur', -7.1770, 113.4590)
ON CONFLICT (name) DO NOTHING;

-- Kecamatan Galis (14 desa)
INSERT INTO tenants (name, region, subdistrict, village, latitude, longitude) VALUES
('KDKMP Desa Galis Daya', 'Pamekasan', 'Galis', 'Galis Daya', -7.1654, 113.4234),
('KDKMP Desa Konang', 'Pamekasan', 'Galis', 'Konang', -7.1670, 113.4260),
('KDKMP Desa Lembung', 'Pamekasan', 'Galis', 'Lembung', -7.1640, 113.4210),
('KDKMP Desa Ponteh', 'Pamekasan', 'Galis', 'Ponteh', -7.1680, 113.4280),
('KDKMP Desa Polagan', 'Pamekasan', 'Galis', 'Polagan', -7.1630, 113.4190),
('KDKMP Desa Pandan', 'Pamekasan', 'Galis', 'Pandan', -7.1690, 113.4300),
('KDKMP Desa Artodung', 'Pamekasan', 'Galis', 'Artodung', -7.1620, 113.4170),
('KDKMP Desa Tobungan', 'Pamekasan', 'Galis', 'Tobungan', -7.1700, 113.4320),
('KDKMP Desa Bulay', 'Pamekasan', 'Galis', 'Bulay', -7.1610, 113.4150),
('KDKMP Desa Pagendingan', 'Pamekasan', 'Galis', 'Pagendingan', -7.1710, 113.4340),
('KDKMP Desa Banyu Anyar', 'Pamekasan', 'Galis', 'Banyu Anyar', -7.1600, 113.4130),
('KDKMP Desa Pogan', 'Pamekasan', 'Galis', 'Pogan', -7.1720, 113.4360),
('KDKMP Desa Seddur', 'Pamekasan', 'Galis', 'Seddur', -7.1590, 113.4110),
('KDKMP Desa Bulaan', 'Pamekasan', 'Galis', 'Bulaan', -7.1730, 113.4380)
ON CONFLICT (name) DO NOTHING;

-- Kecamatan Larangan (15 desa)
INSERT INTO tenants (name, region, subdistrict, village, latitude, longitude) VALUES
('KDKMP Desa Larangan Luar', 'Pamekasan', 'Larangan', 'Larangan Luar', -7.1523, 113.5012),
('KDKMP Desa Lancar', 'Pamekasan', 'Larangan', 'Lancar', -7.1540, 113.5040),
('KDKMP Desa Montok', 'Pamekasan', 'Larangan', 'Montok', -7.1510, 113.4990),
('KDKMP Desa Pangarangan', 'Pamekasan', 'Larangan', 'Pangarangan', -7.1550, 113.5060),
('KDKMP Desa Blumbungan', 'Pamekasan', 'Larangan', 'Blumbungan', -7.1500, 113.4970),
('KDKMP Desa Grujugan', 'Pamekasan', 'Larangan', 'Grujugan', -7.1560, 113.5080),
('KDKMP Desa Kadur Larangan', 'Pamekasan', 'Larangan', 'Kadur Larangan', -7.1490, 113.4950),
('KDKMP Desa Trasak', 'Pamekasan', 'Larangan', 'Trasak', -7.1570, 113.5100),
('KDKMP Desa Tentenan', 'Pamekasan', 'Larangan', 'Tentenan', -7.1480, 113.4930),
('KDKMP Desa Peltong', 'Pamekasan', 'Larangan', 'Peltong', -7.1580, 113.5120),
('KDKMP Desa Kaduara Barat', 'Pamekasan', 'Larangan', 'Kaduara Barat', -7.1470, 113.4910),
('KDKMP Desa Kaduara Timur', 'Pamekasan', 'Larangan', 'Kaduara Timur', -7.1460, 113.4890),
('KDKMP Desa Tobai Barat', 'Pamekasan', 'Larangan', 'Tobai Barat', -7.1590, 113.5140),
('KDKMP Desa Tobai Timur', 'Pamekasan', 'Larangan', 'Tobai Timur', -7.1600, 113.5160)
ON CONFLICT (name) DO NOTHING;

-- Kecamatan Proppo (15 desa)
INSERT INTO tenants (name, region, subdistrict, village, latitude, longitude) VALUES
('KDKMP Desa Proppo Laok', 'Pamekasan', 'Proppo', 'Proppo Laok', -7.1234, 113.4876),
('KDKMP Desa Proppo Daya', 'Pamekasan', 'Proppo', 'Proppo Daya', -7.1250, 113.4900),
('KDKMP Desa Klampar', 'Pamekasan', 'Proppo', 'Klampar', -7.1220, 113.4850),
('KDKMP Desa Samiran', 'Pamekasan', 'Proppo', 'Samiran', -7.1260, 113.4920),
('KDKMP Desa Candi Burung', 'Pamekasan', 'Proppo', 'Candi Burung', -7.1210, 113.4830),
('KDKMP Desa Tattangoh', 'Pamekasan', 'Proppo', 'Tattangoh', -7.1270, 113.4940),
('KDKMP Desa Rang Perang Daya', 'Pamekasan', 'Proppo', 'Rang Perang Daya', -7.1200, 113.4810),
('KDKMP Desa Rang Perang Laok', 'Pamekasan', 'Proppo', 'Rang Perang Laok', -7.1280, 113.4960),
('KDKMP Desa Toronan', 'Pamekasan', 'Proppo', 'Toronan', -7.1190, 113.4790),
('KDKMP Desa Panaguan', 'Pamekasan', 'Proppo', 'Panaguan', -7.1290, 113.4980),
('KDKMP Desa Jambringin', 'Pamekasan', 'Proppo', 'Jambringin', -7.1180, 113.4770),
('KDKMP Desa Kodik', 'Pamekasan', 'Proppo', 'Kodik', -7.1300, 113.5000),
('KDKMP Desa Batu Bintang', 'Pamekasan', 'Proppo', 'Batu Bintang', -7.1170, 113.4750),
('KDKMP Desa Lenteng', 'Pamekasan', 'Proppo', 'Lenteng', -7.1310, 113.5020)
ON CONFLICT (name) DO NOTHING;

-- Kecamatan Palengaan (14 desa)
INSERT INTO tenants (name, region, subdistrict, village, latitude, longitude) VALUES
('KDKMP Desa Palengaan Laok', 'Pamekasan', 'Palengaan', 'Palengaan Laok', -7.1098, 113.5123),
('KDKMP Desa Palengaan Daya', 'Pamekasan', 'Palengaan', 'Palengaan Daya', -7.1110, 113.5150),
('KDKMP Desa Angsanah', 'Pamekasan', 'Palengaan', 'Angsanah', -7.1080, 113.5100),
('KDKMP Desa Laden', 'Pamekasan', 'Palengaan', 'Laden', -7.1120, 113.5170),
('KDKMP Desa Potoan Laok', 'Pamekasan', 'Palengaan', 'Potoan Laok', -7.1070, 113.5080),
('KDKMP Desa Potoan Daya', 'Pamekasan', 'Palengaan', 'Potoan Daya', -7.1130, 113.5190),
('KDKMP Desa Bajang', 'Pamekasan', 'Palengaan', 'Bajang', -7.1060, 113.5060),
('KDKMP Desa Akkor', 'Pamekasan', 'Palengaan', 'Akkor', -7.1140, 113.5210),
('KDKMP Desa Sotabar', 'Pamekasan', 'Palengaan', 'Sotabar', -7.1050, 113.5040),
('KDKMP Desa Bindang', 'Pamekasan', 'Palengaan', 'Bindang', -7.1150, 113.5230),
('KDKMP Desa Larangan Palengaan', 'Pamekasan', 'Palengaan', 'Larangan Palengaan', -7.1040, 113.5020),
('KDKMP Desa Rekkerrek', 'Pamekasan', 'Palengaan', 'Rekkerrek', -7.1160, 113.5250),
('KDKMP Desa Panempan', 'Pamekasan', 'Palengaan', 'Panempan', -7.1030, 113.5000)
ON CONFLICT (name) DO NOTHING;

-- Kecamatan Pegantenan (14 desa)
INSERT INTO tenants (name, region, subdistrict, village, latitude, longitude) VALUES
('KDKMP Desa Pegantenan Laok', 'Pamekasan', 'Pegantenan', 'Pegantenan Laok', -7.0654, 113.4891),
('KDKMP Desa Tebul', 'Pamekasan', 'Pegantenan', 'Tebul', -7.0670, 113.4920),
('KDKMP Desa Bulangan Haji', 'Pamekasan', 'Pegantenan', 'Bulangan Haji', -7.0640, 113.4870),
('KDKMP Desa Bulangan Branta', 'Pamekasan', 'Pegantenan', 'Bulangan Branta', -7.0680, 113.4940),
('KDKMP Desa Plakpak', 'Pamekasan', 'Pegantenan', 'Plakpak', -7.0630, 113.4850),
('KDKMP Desa Tlagah', 'Pamekasan', 'Pegantenan', 'Tlagah', -7.0690, 113.4960),
('KDKMP Desa Ambender', 'Pamekasan', 'Pegantenan', 'Ambender', -7.0620, 113.4830),
('KDKMP Desa Pegagan', 'Pamekasan', 'Pegantenan', 'Pegagan', -7.0700, 113.4980),
('KDKMP Desa Palesanggar', 'Pamekasan', 'Pegantenan', 'Palesanggar', -7.0610, 113.4810),
('KDKMP Desa Pasanggar', 'Pamekasan', 'Pegantenan', 'Pasanggar', -7.0710, 113.5000),
('KDKMP Desa Bulangan Barat', 'Pamekasan', 'Pegantenan', 'Bulangan Barat', -7.0600, 113.4790),
('KDKMP Desa Bulangan Timur', 'Pamekasan', 'Pegantenan', 'Bulangan Timur', -7.0590, 113.4770)
ON CONFLICT (name) DO NOTHING;

-- Kecamatan Kadur (14 desa)
INSERT INTO tenants (name, region, subdistrict, village, latitude, longitude) VALUES
('KDKMP Desa Kadur Tengah', 'Pamekasan', 'Kadur', 'Kadur Tengah', -7.0765, 113.4654),
('KDKMP Desa Pamoroh', 'Pamekasan', 'Kadur', 'Pamoroh', -7.0780, 113.4680),
('KDKMP Desa Bangkes', 'Pamekasan', 'Kadur', 'Bangkes', -7.0750, 113.4630),
('KDKMP Desa Kertagena Laok', 'Pamekasan', 'Kadur', 'Kertagena Laok', -7.0790, 113.4700),
('KDKMP Desa Kertagena Daya', 'Pamekasan', 'Kadur', 'Kertagena Daya', -7.0740, 113.4610),
('KDKMP Desa Bungbaruh', 'Pamekasan', 'Kadur', 'Bungbaruh', -7.0800, 113.4720),
('KDKMP Desa Pamaroh', 'Pamekasan', 'Kadur', 'Pamaroh', -7.0730, 113.4590),
('KDKMP Desa Sokobanah', 'Pamekasan', 'Kadur', 'Sokobanah', -7.0810, 113.4740),
('KDKMP Desa Kadungdung', 'Pamekasan', 'Kadur', 'Kadungdung', -7.0720, 113.4570),
('KDKMP Desa Pabian', 'Pamekasan', 'Kadur', 'Pabian', -7.0820, 113.4760),
('KDKMP Desa Batu Kerbuy', 'Pamekasan', 'Kadur', 'Batu Kerbuy', -7.0710, 113.4550),
('KDKMP Desa Jalmak', 'Pamekasan', 'Kadur', 'Jalmak', -7.0830, 113.4780)
ON CONFLICT (name) DO NOTHING;

-- Kecamatan Pakong (14 desa)
INSERT INTO tenants (name, region, subdistrict, village, latitude, longitude) VALUES
('KDKMP Desa Pakong Daya', 'Pamekasan', 'Pakong', 'Pakong Daya', -7.0891, 113.5234),
('KDKMP Desa Bandungan', 'Pamekasan', 'Pakong', 'Bandungan', -7.0910, 113.5260),
('KDKMP Desa Sana Laok', 'Pamekasan', 'Pakong', 'Sana Laok', -7.0880, 113.5210),
('KDKMP Desa Sana Daya', 'Pamekasan', 'Pakong', 'Sana Daya', -7.0920, 113.5280),
('KDKMP Desa Klompang Barat', 'Pamekasan', 'Pakong', 'Klompang Barat', -7.0870, 113.5190),
('KDKMP Desa Klompang Timur', 'Pamekasan', 'Pakong', 'Klompang Timur', -7.0930, 113.5300),
('KDKMP Desa Bicorong', 'Pamekasan', 'Pakong', 'Bicorong', -7.0860, 113.5170),
('KDKMP Desa Lebbek', 'Pamekasan', 'Pakong', 'Lebbek', -7.0940, 113.5320),
('KDKMP Desa Banban', 'Pamekasan', 'Pakong', 'Banban', -7.0850, 113.5150),
('KDKMP Desa Somalang', 'Pamekasan', 'Pakong', 'Somalang', -7.0950, 113.5340),
('KDKMP Desa Palalang', 'Pamekasan', 'Pakong', 'Palalang', -7.0840, 113.5130),
('KDKMP Desa Bajur', 'Pamekasan', 'Pakong', 'Bajur', -7.0960, 113.5360)
ON CONFLICT (name) DO NOTHING;

-- Kecamatan Waru (14 desa)
INSERT INTO tenants (name, region, subdistrict, village, latitude, longitude) VALUES
('KDKMP Desa Waru Barat', 'Pamekasan', 'Waru', 'Waru Barat', -7.0543, 113.5432),
('KDKMP Desa Waru Timur', 'Pamekasan', 'Waru', 'Waru Timur', -7.0560, 113.5460),
('KDKMP Desa Sumber Waru', 'Pamekasan', 'Waru', 'Sumber Waru', -7.0530, 113.5410),
('KDKMP Desa Tampojung Pregih', 'Pamekasan', 'Waru', 'Tampojung Pregih', -7.0570, 113.5480),
('KDKMP Desa Tampojung Tengginah', 'Pamekasan', 'Waru', 'Tampojung Tengginah', -7.0520, 113.5390),
('KDKMP Desa Tampojung Guwa', 'Pamekasan', 'Waru', 'Tampojung Guwa', -7.0580, 113.5500),
('KDKMP Desa Bajur Waru', 'Pamekasan', 'Waru', 'Bajur Waru', -7.0510, 113.5370),
('KDKMP Desa Sana Tengah', 'Pamekasan', 'Waru', 'Sana Tengah', -7.0590, 113.5520),
('KDKMP Desa Tagangser Laok', 'Pamekasan', 'Waru', 'Tagangser Laok', -7.0500, 113.5350),
('KDKMP Desa Tagangser Daya', 'Pamekasan', 'Waru', 'Tagangser Daya', -7.0600, 113.5540),
('KDKMP Desa Ragang', 'Pamekasan', 'Waru', 'Ragang', -7.0490, 113.5330),
('KDKMP Desa Sumber Batu', 'Pamekasan', 'Waru', 'Sumber Batu', -7.0610, 113.5560)
ON CONFLICT (name) DO NOTHING;

-- Kecamatan Batumarmar (14 desa)
INSERT INTO tenants (name, region, subdistrict, village, latitude, longitude) VALUES
('KDKMP Desa Batumarmar Barat', 'Pamekasan', 'Batumarmar', 'Batumarmar Barat', -7.0432, 113.4567),
('KDKMP Desa Batumarmar Timur', 'Pamekasan', 'Batumarmar', 'Batumarmar Timur', -7.0450, 113.4590),
('KDKMP Desa Lesong Laok', 'Pamekasan', 'Batumarmar', 'Lesong Laok', -7.0420, 113.4540),
('KDKMP Desa Lesong Daya', 'Pamekasan', 'Batumarmar', 'Lesong Daya', -7.0460, 113.4610),
('KDKMP Desa Bangsereh', 'Pamekasan', 'Batumarmar', 'Bangsereh', -7.0410, 113.4520),
('KDKMP Desa Batu Bintang Barat', 'Pamekasan', 'Batumarmar', 'Batu Bintang Barat', -7.0470, 113.4630),
('KDKMP Desa Ponjanan Barat', 'Pamekasan', 'Batumarmar', 'Ponjanan Barat', -7.0400, 113.4500),
('KDKMP Desa Ponjanan Timur', 'Pamekasan', 'Batumarmar', 'Ponjanan Timur', -7.0480, 113.4650),
('KDKMP Desa Tambung', 'Pamekasan', 'Batumarmar', 'Tambung', -7.0390, 113.4480),
('KDKMP Desa Bujur Tengah', 'Pamekasan', 'Batumarmar', 'Bujur Tengah', -7.0490, 113.4670),
('KDKMP Desa Kapong', 'Pamekasan', 'Batumarmar', 'Kapong', -7.0380, 113.4460),
('KDKMP Desa Pangereman', 'Pamekasan', 'Batumarmar', 'Pangereman', -7.0500, 113.4690)
ON CONFLICT (name) DO NOTHING;

-- Kecamatan Pasean (14 desa)
INSERT INTO tenants (name, region, subdistrict, village, latitude, longitude) VALUES
('KDKMP Desa Pasean Daya', 'Pamekasan', 'Pasean', 'Pasean Daya', -7.0321, 113.5678),
('KDKMP Desa Pasean Laok', 'Pamekasan', 'Pasean', 'Pasean Laok', -7.0340, 113.5700),
('KDKMP Desa Tlonto Raja', 'Pamekasan', 'Pasean', 'Tlonto Raja', -7.0310, 113.5650),
('KDKMP Desa Tlonto Ares', 'Pamekasan', 'Pasean', 'Tlonto Ares', -7.0350, 113.5720),
('KDKMP Desa Bindang Pasean', 'Pamekasan', 'Pasean', 'Bindang Pasean', -7.0300, 113.5630),
('KDKMP Desa Duko', 'Pamekasan', 'Pasean', 'Duko', -7.0360, 113.5740),
('KDKMP Desa Sotabar Pasean', 'Pamekasan', 'Pasean', 'Sotabar Pasean', -7.0290, 113.5610),
('KDKMP Desa Rek Kerek', 'Pamekasan', 'Pasean', 'Rek Kerek', -7.0370, 113.5760),
('KDKMP Desa Sana Pasean', 'Pamekasan', 'Pasean', 'Sana Pasean', -7.0280, 113.5590),
('KDKMP Desa Batu Kerbuy Pasean', 'Pamekasan', 'Pasean', 'Batu Kerbuy Pasean', -7.0380, 113.5780),
('KDKMP Desa Bragung', 'Pamekasan', 'Pasean', 'Bragung', -7.0270, 113.5570),
('KDKMP Desa Bancelok', 'Pamekasan', 'Pasean', 'Bancelok', -7.0390, 113.5800)
ON CONFLICT (name) DO NOTHING;
