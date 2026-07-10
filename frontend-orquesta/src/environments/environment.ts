export const environment = {
  production: false,

  // API del backend .NET (perfil http de launchSettings.json)
  url_api: 'https://localhost:7036/api/',
  url_api_maestras: 'https://localhost:7036/api/',

  // 🔌 Interruptor de datos:
  //   true  -> datos de prueba en memoria (no necesita BD ni backend)
  //   false -> consume la API real (backend .NET + SQL Server)
  useMock: false,
};
