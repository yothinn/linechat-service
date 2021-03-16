const amqp = require('amqplib/callback_api');

const AMQP_URL= process.env.AMQP_URL || 'amqp://localhost:5672';

const ON_DEATH = require('death'); //for cleanup

module.exports.publish = function(ex, msgKey, msgPayload )
{   
  amqp.connect(AMQP_URL, function(err, conn) {
      conn.createChannel(function(err, ch) {
        ch.assertExchange(ex, 'direct', {durable: true});
        ch.publish(ex, msgKey, Buffer.from(msgPayload));
        console.log(" [x] Sent '%s'", msgKey);  
        return '';        
      });
          
      ON_DEATH(function(signal, err) {
        //clean up code 
        console.log('##cleaning up...');
        setTimeout(function() { conn.close(); process.exit(0) }, 500);
      })
          
    });

}; 

module.exports.consume = function(ex, qname, msgKey,invkFn )
{
  amqp.connect(AMQP_URL, function(err, conn) {
    conn.createChannel(function(err, ch) {            
      ch.assertExchange(ex, 'direct', {durable: true});
      ch.assertQueue(qname, {exclusive: false}, function(err, q) {
        console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", q.queue);
        ch.bindQueue(q.queue, ex, msgKey);
        ch.consume(q.queue, function(msg) {
          //call the function to be invoked on receipt of a message
          invkFn(msg);
          
          ON_DEATH(function(signal, err) {
            //clean up code 
            console.log('##cleaning up...');
            setTimeout(function() { conn.close(); process.exit(0) }, 500);
          })
    
        }, {noAck: true});
      });
    });
  });  
}