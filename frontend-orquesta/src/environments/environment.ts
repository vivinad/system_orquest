export const environment = {
  production: false,

  // API del backend .NET — puerto http, disponible en los perfiles http y https
  // de launchSettings.json (funciona igual en cualquier máquina)
  url_api: 'http://localhost:5161/api/',
  url_api_maestras: 'http://localhost:5161/api/',

  // 🔌 Interruptor de datos:
  //   true  -> datos de prueba en memoria (no necesita BD ni backend)
  //   false -> consume la API real (backend .NET + SQL Server)
  useMock: false,
};
