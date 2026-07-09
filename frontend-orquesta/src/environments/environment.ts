export const environment = {
  production: false,

  // API del backend .NET (perfil http de launchSettings.json)
  url_api: 'http://localhost:5161/api/',
  url_api_maestras: 'http://localhost:5161/api/',

  // 🔌 Interruptor de datos:
  //   true  -> datos de prueba en memoria (no necesita BD ni backend)
  //   false -> consume la API real (backend .NET + SQL Server)
  useMock: false,
};
