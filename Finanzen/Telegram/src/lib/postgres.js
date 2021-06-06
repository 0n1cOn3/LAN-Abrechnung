const pg = require('pg');
const util = require('util')

const pool = new pg.Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
})

pool.query(`CREATE TABLE IF NOT EXISTS guests (
    userid bigint PRIMARY KEY,
    username text,
    passwort text,
    pc boolean DEFAULT False,
    displays_count smallint DEFAULT 1,
    network_cable boolean DEFAULT False,
    vr boolean DEFAULT False,
    expected_arrival timestamp with time zone,
    expected_departure timestamp with time zone,
    accepted_rules timestamp with time zone,
    accepted_legal timestamp with time zone,
    power_plugid smallint,
    payed boolean DEFAULT False,
    pyed_id text,
    admin boolean DEFAULT False,
    vaccinated text,
    time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP)`, (err, result) => {
    if (err) {console.log(err)}
});
/*
pool.query(`CREATE TABLE IF NOT EXISTS plugs (
  plugid serial,
  ipaddr inet,
  userid bigint,
  state boolean DEFAULT False,
  allowed_state boolean DEFAULT False,
  energy_now double precision,
  voltage_now double precision,
  time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (plugid),
  CONSTRAINT userid_unique UNIQUE (userid),
  CONSTRAINT ipaddr_unique UNIQUE (ipaddr))`, (err, result) => {
  if (err) {console.log(err)}
});

pool.query(`CREATE TABLE IF NOT EXISTS plugs_history (
  plugid smallint,
  energy double precision,
  time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (plugid,time),
  CONSTRAINTS plugid_fk FOREIGN KEY(plugid) REFERENCES plugs(plugid) ON UPDATE CASCADE ON DELETE CASCADE)`, (err, result) => {
  if (err) {console.log(err)}
});

pool.query(`CREATE TABLE IF NOT EXISTS power_history (
  plugid smallint,
  energy_now double precision,
  voltage_now double precision,
  time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (energy_now,voltage_now,time),
  CONSTRAINTS plugid_fk FOREIGN KEY(plugid) REFERENCES plugs(plugid) ON UPDATE CASCADE ON DELETE CASCADE)`, (err, result) => {
  if (err) {console.log(err)}
});
*/
pool.query(`CREATE TABLE IF NOT EXISTS regtoken (
  userid bigint,
  username text,
  token text PRIMARY KEY,
  time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP)`, (err, result) => {
  if (err) {console.log(err)}
});

pool.query(`CREATE TABLE IF NOT EXISTS webtoken (
  userid bigint,
  username text,
  ip INET,
  browser text,
  token text PRIMARY KEY,
  admin boolean DEFAULT False,
  time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP)`, (err, result) => {
  if (err) {console.log(err)}
});

pool.query(`CREATE TABLE IF NOT EXISTS products (
  produktname text PRIMARY KEY,
  produktcompany text,
  price integer,
  amount integer,
  bought integer,
  time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP)`, (err, result) => {
  if (err) {console.log(err)}
});

pool.query(`CREATE TABLE IF NOT EXISTS shopinglist (
  userid bigint,
  produktname text PRIMARY KEY,
  produktcompany text,
  price integer,
  bought integer,
  time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP)`, (err, result) => {
  if (err) {console.log(err)}
});

pool.query(`CREATE TABLE IF NOT EXISTS innersync (
  targetapp text,
  id text PRIMARY KEY,
  message text,
  chatid bigint,
  type text,
  time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP)`, (err, result) => {
  if (err) {console.log(err)}
});

/**
 * This function will return all guests
 * @returns Array
 */
 let GetGuests = function() {
    return new Promise(function(resolve, reject) {
      pool.query('SELECT * FROM guests', (err, result) => {
        if (err) {reject(err)}
        resolve(result.rows)
      });
    });
  }

/**
 * This function will return a guest by userid
 * @param {number} user_id
 * @returns {Object}
 */
 let GetGuestsByID = function(user_id) {
    return new Promise(function(resolve, reject) {
      pool.query(`SELECT * FROM guests WHERE userid = '${user_id}'`, (err, result) => {
        if (err) {reject(err)}
        resolve(result.rows)
      });
    });
  }

/**
 * This function will check if a user exists
 * @param {number} user_id
 * @returns {boolean}
 */
 let CheckGuestByID = function(user_id) {
    return new Promise(function(resolve, reject) {
      pool.query(`SELECT * FROM guests WHERE userid = '${user_id}'`, (err, result) => {
        if (err) {reject(err)}
        if(result.rows.length <= 0){
          resolve(false)
        }else{
          resolve(true)
        }
      });
    });
  }

/**
 * This function will check if a user had accepted rules & legal
 * @param {number} user_id
 * @returns {boolean}
 */
 let CheckGuestRulesByID = function(user_id) {
  return new Promise(function(resolve, reject) {
    pool.query(`SELECT * FROM guests WHERE userid = '${user_id}'`, (err, result) => {
      if (err) {reject(err)}
      if(typeof result.rows[0].accepted_rules !== 'undefined' && typeof result.rows[0].accepted_legal !== 'undefined'){
        resolve(true)
      }else{
        resolve(false)
      }
    });
  });
}

/**
 * This function will check if a user is admin
 * @param {number} user_id
 * @returns {boolean}
 */
 let CheckIfAdminbyID = function(user_id) {
  return new Promise(function(resolve, reject) {
    pool.query(`SELECT admin FROM guests WHERE userid = '${user_id}'`, (err, result) => {
      if (err) {reject(err)}
      if(result.rows.length === 1){
        if(result.rows[0].admin === true){
          resolve(true)
        }else{
          resolve(false)
        }
      }else{
        resolve(false)
      }
    });
  });
}

/**
 * This function will return a list of Admins
 * @returns {Object}
 */
 let ListAllAdmin = function() {
  return new Promise(function(resolve, reject) {
    pool.query(`SELECT * FROM guests WHERE admin = 'true'`, (err, result) => {
      if (err) {reject(err)}
      resolve(result.rows)
    });
  });
}

/**
 * This function will write a collum and the value of that collum
 * @param {number} User_id
 * @param {String} collum
 * @param {any} value
 * @returns {Promise}
 */
 let UpdateCollumByID = function(User_id, collum, value) {
    return new Promise(function(resolve, reject) {
      pool.query(`UPDATE guests SET ${collum} = $1 WHERE userid = $2`,[
      value, User_id
      ], (err, result) => {
        if (err) {reject(err)}
        resolve(result)
      });
    });
  }

/**
 * This function will write new user to DB
 * @param {number} User_id
 * @param {String} username
 * @returns {Promise}
 */
 let WriteNewUser = function(User_id, username) {
  return new Promise(function(resolve, reject) {
    pool.query('INSERT INTO guests (userid, username) VALUES ($1,$2) ON CONFLICT (userid) DO UPDATE SET username=$2',[
      User_id, username
    ], (err, result) => {
      if (err) {reject(err)}
      resolve(result)
    });
  });
}

/**
 * This function will write a new token into regtoken db
 * @param {number} User_id
 * @param {String} username
 * @param {String} token
 * @returns {Promise}
 */
 let WriteNewRegToken = function(User_id, username, token) {
  return new Promise(function(resolve, reject) {
    pool.query('INSERT INTO regtoken (userid, username, token) VALUES ($1,$2,$3)',[
      User_id, username, token
    ], (err, result) => {
      if (err) {reject(err)}
      resolve(result)
    });
  });
}

/**
 * This function will get the data of a token
 * @param {String} Token
 * @returns {Promise}
 */
 let GetRegTokenByToken = function(Token) {
  return new Promise(function(resolve, reject) {
    pool.query(`SELECT * FROM regtoken WHERE token = '${Token}'`, (err, result) => {
      if (err) {reject(err)}
        resolve(result)
    });
  });
}

/**
 * This function will delete a token
 * @param {String} Token
 * @returns {Promise}
 */
 let DelRegTokenByToken = function(Token) {
  return new Promise(function(resolve, reject) {
    pool.query(`DELETE FROM regtoken WHERE token = '${Token}'`, (err, result) => {
      if (err) {reject(err)}
        resolve(result)
    });
  });
}

/**
 * This function is used to send messages to the TelegramApp
 * @param {String} id
 * @param {String} targetapp
 * @param {object} message
 * @returns {Promise}
 */
 let PostNewMessage = function(targetapp, id, message) {
  return new Promise(function(resolve, reject) {
    pool.query('INSERT INTO innersync (targetapp, id, message, chatid, type) VALUES ($1,$2,$3,$4,$5)',[
      targetapp, id, message.text, message.chatid, message.type
    ], (err, result) => {
      if (err) {reject(err)}
      resolve(result)
    });
  });
}

/**
 * This function is used to delete the message send command
 * @param {String} ID
 * @returns {Promise}
 */
 let DelNewMessage = function(ID) {
  return new Promise(function(resolve, reject) {
    pool.query(`DELETE FROM innersync WHERE id = '${ID}'`, (err, result) => {
      if (err) {reject(err)}
        resolve(result)
    });
  });
}

/**
 * This function will get all messages to prosses
 * @returns {Promise}
 */
 let GetNewMessages = function() {
  return new Promise(function(resolve, reject) {
    pool.query(`SELECT * FROM innersync`, (err, result) => {
      if (err) {reject(err)}
        resolve(result)
    });
  });
}




let get = {
  Guests: {
    All: GetGuests,
    Admins: ListAllAdmin,
    ByID: GetGuestsByID,
    Check: {
      ByID: CheckGuestByID,
      Admin: CheckIfAdminbyID,
      Rules: CheckGuestRulesByID
    }
  },
  RegToken: {
    ByToken: GetRegTokenByToken
  }
}

let write = {
  Guests: {
    UpdateCollumByID: UpdateCollumByID,
    NewUser: WriteNewUser
  },
  RegToken: {
    NewToken: WriteNewRegToken
  }
}

let del = {
  RegToken: {
    DeleteToken: DelRegTokenByToken
  }
}

let message = {
  PostNew: PostNewMessage,
  Delete: DelNewMessage,
  GetAll: GetNewMessages
}

module.exports = {
    get,
    write,
    del,
    message
};