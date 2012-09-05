/**
 * Module dependencies.
 */
var util = require('util')
  , OAuth2Strategy = require('passport-oauth').OAuth2Strategy;


/**
 * `Strategy` constructor.
 *
 * The Windows Live authentication strategy authenticates requests by delegating
 * to Windows Live using the OAuth 2.0 protocol.
 *
 * Applications must supply a `verify` callback which accepts an `accessToken`,
 * `refreshToken` and service-specific `profile`, and then calls the `done`
 * callback supplying a `user`, which should be set to `false` if the
 * credentials are not valid.  If an exception occured, `err` should be set.
 *
 * Options:
 *   - `clientID`      your Windows Live application's client ID
 *   - `clientSecret`  your Windows Live application's client secret
 *   - `callbackURL`   URL to which Windows Live will redirect the user after granting authorization
 *
 * Examples:
 *
 *     passport.use(new WindowsLiveStrategy({
 *         clientID: '123-456-789',
 *         clientSecret: 'shhh-its-a-secret'
 *         callbackURL: 'https://www.example.net/auth/windowslive/callback'
 *       },
 *       function(accessToken, refreshToken, profile, done) {
 *         User.findOrCreate(..., function (err, user) {
 *           done(err, user);
 *         });
 *       }
 *     ));
 *
 * @param {Object} options
 * @param {Function} verify
 * @api public
 */
function Strategy(options, verify) {
  options = options || {};
  options.authorizationURL = options.authorizationURL || 'https://oauth.live.com/authorize';
  options.tokenURL = options.tokenURL || 'https://oauth.live.com/token';
  
  OAuth2Strategy.call(this, options, verify);
  this.name = 'windowslive';
}

/**
 * Inherit from `OAuth2Strategy`.
 */
util.inherits(Strategy, OAuth2Strategy);


/**
 * Retrieve user profile from Windows Live.
 *
 * This function constructs a normalized profile, with the following properties:
 *
 *   - `provider`         always set to `windowslive`
 *   - `id`               the user's Windows Live ID
 *   - `displayName`      the user's full name
 *
 * @param {String} accessToken
 * @param {Function} done
 * @api protected
 */
Strategy.prototype.userProfile = function(accessToken, done) {
  this._oauth2.getProtectedResource('https://apis.live.net/v5.0/me', accessToken, function (err, body, res) {
    if (err) { return done(err); }
    
    try {
      o = JSON.parse(body);

      var profile = { provider: 'windowslive' };
      profile.id = o.id;
      profile.username = o.username;
      profile.displayName = o.name;
      profile.gender = o.gender;
      profile.profileUrl = o.link;
      profile.emails = [{ value: o.emails.preferred }];
      profile.name = { familyName: o.last_name,
                       givenName: o.first_name };
      
      done(null, profile);
    } catch(e) {
      done(e);
    }
  });
}


/**
 * Expose `Strategy`.
 */
module.exports = Strategy;
