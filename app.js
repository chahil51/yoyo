document.addEventListener('DOMContentLoaded', (event) => {
    let bleDevice;
    let bleServer;
    let heartRateCharacteristic;
    let uartRxCharacteristic;
    let uartTxCharacteristic;
    var podid1 = 542428048;
    var podid2 = 1366019124;
    var podid3 = 553436048;
    var msgtyp = 'yoyo'

    var pod3time=0;
    var pod2time=0;
    var globallevel=0;
    var globaltimeout=0;
    var speed =0;
    var timetaken= 0;
    var current_level=0;
    var current_timeout=0;
    var gloablspeed=0;
    var current_speed=0;
var runyoyoagain = false;
    // Connect to NRF UART device





    



    async function connectToAtom() {
        try {
            bleDevice = await navigator.bluetooth.requestDevice({
                filters: [{ services: ['6e400001-b5a3-f393-e0a9-e50e24dcca9e'] }]
            });
            bleServer = await bleDevice.gatt.connect();
            const service = await bleServer.getPrimaryService('6e400001-b5a3-f393-e0a9-e50e24dcca9e');
            uartRxCharacteristic = await service.getCharacteristic('6e400003-b5a3-f393-e0a9-e50e24dcca9e');
            uartTxCharacteristic = await service.getCharacteristic('6e400002-b5a3-f393-e0a9-e50e24dcca9e');
            await uartRxCharacteristic.startNotifications();
            uartRxCharacteristic.addEventListener('characteristicvaluechanged', handleUartData);
            document.getElementById('atomstatus').textContent = 'Connected';
            sendmsgtyp('buzz');
        } catch (error) {
            document.getElementById('atomstatus').textContent = `failed to connect ${error}`;
        }
    }

    // Connect to Heart Rate Monitor
    async function connectToHeartRateMonitor() {
                try {
                    const hrDevice = await navigator.bluetooth.requestDevice({
                        filters: [{ services: ['heart_rate'] }]
                    });
                    const hrServer = await hrDevice.gatt.connect();
                    const hrService = await hrServer.getPrimaryService('heart_rate');
                    heartRateCharacteristic = await hrService.getCharacteristic('heart_rate_measurement');
                    heartRateCharacteristic.startNotifications();
                    heartRateCharacteristic.addEventListener('characteristicvaluechanged', handleHeartRateMeasurement);
                    document.getElementById('hrstatus').textContent = 'Connected';
                } catch (error) {
                    document.getElementById('hrstatus').textContent = `failed to connect${error}`;
                }
            }


            document.getElementById('connect').addEventListener('click', connectToAtom);
            document.getElementById('connectHR').addEventListener('click', connectToHeartRateMonitor);
        


document.getElementById('buzz').addEventListener('click', async () => {
    sendDataOverUart('{"msgtyp":"buzz"}');

});


//ondisconnect



var heart_rate_measurement = 0;

function sendmsgtyp(msg)
    {
sendDataOverUart('{"msgtyp":"'+msg+'"}');
    }


            // Handle Heart Rate Measurements
            function handleHeartRateMeasurement(event) {
                const value = event.target.value;
                const heartRate = value.getUint8(1); // Assuming the heart rate value format UINT8
                heart_rate_measurement = heartRate;
                document.getElementById('heartRate').textContent = `💙Heart Rate: ${heartRate} BPM`;
            }
			

            //get the button called "start" and add an event listener to it
       
			
//function to genrate {"podid1": "542428048","podid2": "1366019124","podid3": "553436048","msgtyp": "yoyo","level": "5.0","timeout": "10000"}
function jsonstring(podid1,podid2,podid3,msgtyp,level,timeout){
    return '{"podid1":"'+podid1+'","podid2":"'+podid2+'","podid3":"'+podid3+'","msgtyp":"'+msgtyp+'","level":"'+level+'","timeout":"'+timeout+'"}';

}



var firstheart=0;
var secondheart=0;



function runyoyo(level,timeout){
  
    globallevel=level;
    globaltimeout=timeout;
    //SET THE LEVEL
    //SET THE TIMEOUT
    document.getElementById('level').textContent = `Level: ${level}`;
    document.getElementById('setTime').textContent = `Set Time:${timeout}`;
  sendDataOverUart(jsonstring(podid1,podid2,podid3,msgtyp,level,timeout));
   setTimeout(()=> {
      
       firstheart=heart_rate_measurement;
    }
    ,timeout);

    setTimeout(()=> {
    
       secondheart=heart_rate_measurement;
       recoveryRate=firstheart-secondheart;
  //update the table
   addTestResult(
       current_level,
       globaltimeout,
       current_timeout,
       gloablspeed,
       current_speed,
       recoveryRate
   );
   
    }
    ,timeout+10000);




}



let counter = 0;
let timeoutarray = [14000/2,12000/2,11000/2,12000/2,10000/2,11000/2,11000/2,10000/2,10000/2,10000/2,11000/2];
let levelarray = [5.1,9.1,11.1,11.2,12.1,12.2,12.3,13.1,13.2,13.3,13.4];
let listsize=10;

document.getElementById('starttest').addEventListener('click', async () => {
    //send jsonstring to atom like this {"podid1": "542428048","podid2": "1366019124","podid3": "553436048","msgtyp": "yoyo","level": "5.0","timeout": "10000"}
//make json variable function
//send json string to atom  




runyoyo(levelarray[counter],timeoutarray[counter]);

setTimeout(()=> {

    //click the button again
if(runyoyoagain)
{
//cheack if counter is less than 6
if(counter<listsize)
{
    document.getElementById('start').click();
}
else
{
    //do nothing    
}

}
},timeoutarray[counter]+10000);

counter++;





// await  sendDataOverUart(jsonstring(podid1,podid2,podid3,msgtyp,level,timeout));
});























    // Handle UART Data
    
    let rxBuffer = '';
    function handleUartData(event) {
        const decoder = new TextDecoder();
        const value = decoder.decode(event.target.value);
        // Add the received data to the buffer
        rxBuffer += value;
        // Check if the buffer ends with a newline character
        const newlineIndex = rxBuffer.indexOf('\n');
        if (newlineIndex !== -1) {
            // Extract the complete string and log it
            const completeString = rxBuffer.slice(0, newlineIndex);
           // log.textContent = ;
           console.log(completeString);
            // Process the string
            processUartMessage(completeString);

            // Remove the complete string from the buffer
            rxBuffer = rxBuffer.slice(newlineIndex + 1);
        }
    }

    // Function to send data over UART
    async function sendDataOverUart(data) {
        const encoder = new TextEncoder();
        const encoded = encoder.encode(data + '\n');
        if (uartTxCharacteristic) {
            
            await uartTxCharacteristic.writeValueWithResponse(encoded);
            console.log('Sending: ' + data);
        }
    }

  
    
    function processUartMessage(message) {
        console.log('Received: ' + message);
      // Parse the JSON data
      const jsonData = JSON.parse(message);

      // Extract data
      const podId = jsonData.podid;
      const level = jsonData.level;
      const detectionTime = jsonData.detectiontime;
      const macAddress = jsonData.mac; // If you need to use it
  
      // Process data based on the pod ID
      switch(podId) {
          case 1:
              
              break;
          case 2:
             pod2time = detectionTime;
             gloablspeed=20/(globaltimeout/1000)
      
             current_timeout=pod2time+pod3time;;
              current_speed = 20/(current_timeout/1000);
              current_level=globallevel;
              if(pod2time==globaltimeout/2){
                runyoyoagain=false;
              }
              else{
                runyoyoagain=true;
              }
                
              

              break;
          case 3:
             pod3time = detectionTime;
              break;
          default:
              // Handle unknown pod ID
              console.error('Unknown pod ID:', podId);
      }
  
    }

    function addTestResult(level, setTime, gotTime, requiredSpeed, obtainedSpeed, recoveryRate) {
        const table = document.getElementById('results').getElementsByTagName('tbody')[0];
        const row = table.insertRow();
    
        // Add each cell in the row
        row.insertCell(0).textContent = level;
        row.insertCell(1).textContent = setTime;
        row.insertCell(2).textContent = gotTime;
        row.insertCell(3).textContent = requiredSpeed.toFixed(2);
        row.insertCell(4).textContent = obtainedSpeed.toFixed(2);
        row.insertCell(5).textContent = recoveryRate.toFixed(2);
    }


    const testData = [
        { level: 1, setTime: 10000, gotTime: 9500, requiredSpeed: 3, obtainedSpeed: 3.5, recoveryRate: 95 },
        // ... more test data ...
    ];
    
    // Function to process the test data and add to the table

    
    // Call the function to process and display the test data
    //processTestData();

    // Add additional functions to handle NRF UART data, start/stop tests, etc.

});









// document.addEventListener('DOMContentLoaded', (event) => {
//     let bleDevice;
//     let bleServer;
//     let heartRateCharacteristic;
//     let uartRxCharacteristic;
//     let uartTxCharacteristic;
//     var podid1 = 542428048;
//     var podid2 = 1366019124;
//     var podid3 = 553436048;
//     var msgtyp = 'yoyo'
//     // Connect to NRF UART device
//     document.getElementById('connect').addEventListener('click', async () => {
//         try {
//             bleDevice = await navigator.bluetooth.requestDevice({
//                 filters: [{ services: ['6e400001-b5a3-f393-e0a9-e50e24dcca9e'] }]
//             });
//             bleServer = await bleDevice.gatt.connect();
//             const service = await bleServer.getPrimaryService('6e400001-b5a3-f393-e0a9-e50e24dcca9e');
//             uartRxCharacteristic = await service.getCharacteristic('6e400003-b5a3-f393-e0a9-e50e24dcca9e');
//             uartTxCharacteristic = await service.getCharacteristic('6e400002-b5a3-f393-e0a9-e50e24dcca9e');
//             await uartRxCharacteristic.startNotifications();
//             uartRxCharacteristic.addEventListener('characteristicvaluechanged', handleUartData);
//             document.getElementById('atomstatus').textContent = 'Connected to Atom';
//             sendmsgtyp('buzz');
//         } catch (error) {
//             document.getElementById('atomstatus').textContent = `failed to connect to Atom ${error}`;
//         }
//     });

//     // Connect to Heart Rate Monitor
//       document.getElementById('connectHR').addEventListener('click', async () => {
//                 try {
//                     const hrDevice = await navigator.bluetooth.requestDevice({
//                         filters: [{ services: ['heart_rate'] }]
//                     });
//                     const hrServer = await hrDevice.gatt.connect();
//                     const hrService = await hrServer.getPrimaryService('heart_rate');
//                     heartRateCharacteristic = await hrService.getCharacteristic('heart_rate_measurement');
//                     heartRateCharacteristic.startNotifications();
//                     heartRateCharacteristic.addEventListener('characteristicvaluechanged', handleHeartRateMeasurement);
//                     document.getElementById('heartRateStatus').textContent = 'Connected to Heart Rate Monitor';
//                 } catch (error) {
//                     document.getElementById('heartRateStatus').textContent = `failed to connect to heartRate ${error}`;
//                 }
//             });

// document.getElementById('buzz').addEventListener('click', async () => {
//     sendDataOverUart('{"msgtyp":"buzz"}');

// });



// function sendmsgtyp(msg)
//     {
// sendDataOverUart('{"msgtyp":"'+msg+'"}');
//     }


//             // Handle Heart Rate Measurements
//             function handleHeartRateMeasurement(event) {
//                 const value = event.target.value;
//                 const heartRate = value.getUint8(1); // Assuming the heart rate value format UINT8
//                 document.getElementById('heartRate').textContent = `Heart Rate: ${heartRate} BPM`;
//             }
			

//             //get the button called "start" and add an event listener to it
//             document.getElementById('start').addEventListener('click', async () => {
//                 //send jsonstring to atom like this {"podid1": "542428048","podid2": "1366019124","podid3": "553436048","msgtyp": "yoyo","level": "5.0","timeout": "10000"}
//             //make json variable function
//             //send json string to atom  
       
//             var level = '5.0';
//             var timeout = 15000;
            
//             await  sendDataOverUart(jsonstring(podid1,podid2,podid3,msgtyp,level,timeout));
//             });
			
// //function to genrate {"podid1": "542428048","podid2": "1366019124","podid3": "553436048","msgtyp": "yoyo","level": "5.0","timeout": "10000"}
// function jsonstring(podid1,podid2,podid3,msgtyp,level,timeout){
//     return '{"podid1":"'+podid1+'","podid2":"'+podid2+'","podid3":"'+podid3+'","msgtyp":"'+msgtyp+'","level":"'+level+'","timeout":"'+timeout+'"}';

// }


//     // Handle UART Data
    
//     let rxBuffer = '';
//     function handleUartData(event) {
//         const decoder = new TextDecoder();
//         const value = decoder.decode(event.target.value);
//         // Add the received data to the buffer
//         rxBuffer += value;
//         // Check if the buffer ends with a newline character
//         const newlineIndex = rxBuffer.indexOf('\n');
//         if (newlineIndex !== -1) {
//             // Extract the complete string and log it
//             const completeString = rxBuffer.slice(0, newlineIndex);
//            // log.textContent = ;
//            console.log(completeString);
//             // Process the string
//             processUartMessage(completeString);

//             // Remove the complete string from the buffer
//             rxBuffer = rxBuffer.slice(newlineIndex + 1);
//         }
//     }

//     // Function to send data over UART
//     async function sendDataOverUart(data) {
//         const encoder = new TextEncoder();
//         const encoded = encoder.encode(data + '\n');
//         if (uartTxCharacteristic) {
            
//             await uartTxCharacteristic.writeValueWithResponse(encoded);
//             console.log('Sending: ' + data);
//         }
//     }

//     function processUartMessage(message) {
//         console.log('Received: ' + message);
//         // add data to the log
//         dataLog.textContent += message + '\n';
//         // Here you would parse the message and take action based on its content
//         // For example, if the message is JSON, you could parse it and update the UI or internal state
//         try {
//             const data = JSON.parse(message);
//             // Update UI or internal state based on data
//             // For example:
//             // if (data.msgtyp === 'yoyo') { ... }
//         } catch (e) {
//             console.error('Received non-JSON message:', message);
//         }
//     }


//     // Add additional functions to handle NRF UART data, start/stop tests, etc.
// });


// // Function to handle incoming JSON data and update the table
// function handleIncomingData(jsonData) {
//     // Parse the JSON data
//     const data = JSON.parse(jsonData);

//     // Find the table by ID
//     const table = document.getElementById('resultsTable');

//     // Insert a new row at the end of the table
//     const newRow = table.insertRow(-1);

//     // Insert cells for level, pod ID, detection time, and obtained speed
//     const levelCell = newRow.insertCell(0);
//     const podIdCell = newRow.insertCell(1);
//     const detectionTimeCell = newRow.insertCell(2);
//     const obtainedSpeedCell = newRow.insertCell(3);

//     // Set the text content for each cell
//     levelCell.textContent = data.level;
//     podIdCell.textContent = data.podid;
//     detectionTimeCell.textContent = data.detectiontime;
    
//     // Calculate the obtained speed (example calculation, needs to be adjusted based on actual logic)
//     const obtainedSpeed = calculateSpeed(data.detectiontime, data.podid);
//     obtainedSpeedCell.textContent = obtainedSpeed.toFixed(2);
// }

// // Function to calculate speed based on detection time and pod ID (placeholder function)
// function calculateSpeed(detectionTime, podId) {
//     const distance = podId === 2 ? 20 : podId === 3 ? 5 : 0; // Example distances
//     const timeInSeconds = detectionTime / 1000;
//     return distance / timeInSeconds; // speed = distance / time
// }

// // Add a mock function to simulate receiving data
// // This would be replaced by the actual BLE data handling logic
// function simulateDataReception() {
//     const exampleData = '{"msgtyp":"yoyo","podid":2,"level":5,"detectiontime":4335,"mac":"f4:12:fa:c1:8a:40"}';
//     handleIncomingData(exampleData);
// }

// // Simulate data reception after a delay to test the update logic
// setTimeout(simulateDataReception, 2000);
//