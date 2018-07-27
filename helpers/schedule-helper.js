var exports = {}
var exec = require('child_process').exec
var spawn = require('child_process').spawn

const getSessionApiUrl = (id) => `https://smeni.mk:3002/api/sessions/${id}/prepare`
const logFileUrl = '/var/www/log.txt'

const spawnInstance = (scheduledTime, sessionId) => {
  const c = spawn('at', [scheduledTime])
  return command => {
    return new Promise((resolve, reject) => {
      c.stdout.on('data', d => resolve({ msg: String(d || 'empty stdout.\n') }))
      c.stderr.once('data', d => resolve({ msg: String(d || 'empty stderr.\n') }))
      c.stdin.write(`wget --no-check-certificate -O /dev/null '${getSessionApiUrl(sessionId)}' 2>> ${logFileUrl}`)
      c.stdin.end(`\n`)
    })
  }
}

exports.scheduleTask = (scheduledTime, sessionId) => {
  if (!scheduledTime) return Promise.reject({ msg: 'invalidData' })

  console.log(scheduledTime)

  const scheduler = spawnInstance(scheduledTime, sessionId)
  return scheduler()
  	.then(resp => Promise.resolve({ msg: resp }))
	.catch(err => Promise.reject({ err }))
}

exports.clearTask = (taskId) => { // not like this? or who cares
  if (taskId == null) return Promise.reject({ msg: 'invalidData' })
  return new Promise((resolve, reject) => {
  	exec(`atrm ${taskId}`, (error, stdout, stderr) => {
      let errObj = null
  	  if (error) errObj = error
    
  	  const response = []
      if (stdout) response.push(stdout)
      if (stderr) response.push(stderr)
      
      if (!error) {
      	resolve({ success: true, msgs: response })
      } else {
      	reject({ msgs: response, err: error })
      }
  	})
  })
}

exports.listTasks = () => { // not like this? or who cares
  return new Promise((resolve, reject) => {
  	exec(`atq`, (error, stdout, stderr) => {
      let errObj = null
  	  if (error) errObj = error
    
  	  const response = []
      if (stdout) response.push(stdout)
      if (stderr) response.push(stderr)
      
      if (!error) {
      	resolve({ success: true, msgs: response })
      } else {
      	reject({ msgs: response, err: error })
      }
  	})
  })
}

module.exports = exports
