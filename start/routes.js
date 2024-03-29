'use strict'

/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| Http routes are entry points to your web application. You can create
| routes for different URLs and bind Controller actions to them.
|
| A complete guide on routing is available here.
| http://adonisjs.com/docs/4.1/routing
|
*/

/** @type {typeof import('@adonisjs/framework/src/Route/Manager')} */
const Route = use('Route')

// AUTH
Route.get("/generate-token", "TokenController.generate");
Route.post("/voice", "TokenController.voice");
Route.get("/recordings", "TokenController.recordings");
Route.get("/recordings/:callSid", "TokenController.recording");
Route.get("/fallback", "TokenController.fallback");
Route.post("/recordings/callback", "TokenController.recordCallback");

Route.get('/', () => {
  return { greeting: 'Hello world in JSON' }
})
