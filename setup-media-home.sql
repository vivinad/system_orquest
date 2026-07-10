USE ORQUESTA;
GO

-- Videos de YouTube y fotos de portada que se muestran en la página principal.
-- El admin los gestiona desde "Contenido web".
CREATE TABLE MediaHome (
    id INT IDENTITY(1,1) PRIMARY KEY,
    tipo NVARCHAR(20) NOT NULL,   -- 'video' (ID de YouTube) o 'foto' (imagen)
    valor NVARCHAR(MAX) NOT NULL, -- ID del video o la imagen (nombre de archivo o base64)
    orden INT NOT NULL DEFAULT 0
);
GO

-- Contenido actual del home
INSERT INTO MediaHome (tipo, valor, orden) VALUES
('video', '2Qjpa-Tkbd0', 1),
('video', '8wZEO0-0uXc', 2),
('video', 'gF-QTKfEmrs', 3),
('video', 'ODzmbdhZ42U', 4),
('video', 'osJSiNGWoQ4', 5),
('video', 'dZxinGCr6cU', 6),
('video', 'AIf5rnoSUoY', 7),
('video', 'j7ReJx63Zgw', 8),
('foto', 'imagen2.jpg', 1),
('foto', 'imagen3.jpg', 2),
('foto', 'imagen1.jpg', 3),
('foto', 'imagen4.png', 4),
('foto', 'imagen5.png', 5),
('foto', 'imagen6.png', 6),
('foto', 'imagen7.png', 7);
GO
