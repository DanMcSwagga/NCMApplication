// Task --------------------------------------------------

const R_a = 20.0 * Math.pow(10.0, -2);              // 20cm - interior radius
const R_b = 100.0 * Math.pow(10.0, -2);             // 100cm - external radius
const G = 1.5 * Math.pow(10.0, 5);                  // 1.5*10^5 W/m^3 - power
const T_a = 20.0;                                   // 20C - exterior temperature
const Q_b = 2500.0;                                 // 2500 W/m^2 - interior heat stream
const K = 50.0;                                     // W/(m*deg) - thermal conductivity coefficient
const T_0 = 20.0;                                   // 20C - initial temperature
const alpha = 1.0 * Math.pow(10.0, -2);             // m^2/s - thermal diffusivity coefficient
const beta = 0.25                                   // TODO explanation
const N = 50;                                       // amount of parts | iterations-1
const delta = (R_b - R_a) / N;                      // each part of the system of corner points
const p = 2.0;                                      // formula's coefficient
const timeSample = Math.pow(delta, 2)*beta / alpha  // time discretization / sampling

//--------------------------------------------------------

// T(r,t)-? , where t={5,10,15,20,25,50} sec.

// Solution ----------------------------------------------

var T = [];     // temperature array of current values
var Tn = [];    // temperature array of next values
var timeArray = [5.0, 10.0, 15.0, 20.0, 25.0, 50.0]; // time moments array

// output in Google Charts
var resultX = new matrixArray(1, 0);
var resultY = new matrixArray(6, 0);

// fill the horizontal xAxis of the chart
for (let i = 0; i < N + 1; i++)
    resultX[0][i] = R_a + i * delta;


thermalConductivity(T, Tn, timeArray, resultY);

// calculation of thermal conductivity in different moments of time
function thermalConductivity(T, Tn, timeArray, resultY) {
    for (let t = 0; t < 6; t++) {
        let time = timeArray[t];
        let N_t = time / timeSample;

        // initial fill of the result array
        for (let i = 0; i < N + 1; i++) {
            T[i] = T_0;
        }

        // conductivity calculation
        for (let it = 1; it < N_t + 1; it++) {

            let rhs = beta*G*delta*delta / K;

            for (let i = 1; i < N; i++) {
                Tn[i] = T[i-1] * ( beta*(1 - (p * delta / 2.0) / (R_a + delta * i)) )
                        + T[i] * (1 - 2.0*beta)
                        + T[i+1] * ( beta*(1 + (p * delta / 2.0) / (R_a + delta * i)) )
                        + rhs;
            }

            // left border
            Tn[0] = (T[1] + 2.0*delta*Q_b/K) * ( beta*(1 - (p*delta / 2.0 / R_a)) )
                    + T[0] * (1 - 2.0*beta)
                    + T[1] * ( beta*(1 + (p*delta / 2.0 / R_a)) )
                    + rhs;
            
            // right border
            Tn[N] = T_a;

            // copying
            for (let i = 0; i < N + 1; i++) {
                T[i] = Tn[i];
            }
        }

        // saving current values from the result array for future output
        for (let i = 0; i < N + 1; i++) {
            resultY[t][i] = T[i];
        }
        varDump(resultY[t], 'T['+t+']');
    }
}


// matrix-like arrays used in google charts
function matrixArray(rows, columns) {
    var arr = new Array();
    for(var i = 0; i < rows; i++)
        arr[i] = new Array();
    return arr;
}

// object info's dump for debug (similar to PHP) 
function varDump(obj, string) {
    var out = '';
    for (var i in obj)
        out += "" + string + "\t" + i + ":\t\t " + obj[i] + "\n";

    console.log('Object: \n' + out);
}


// Output ------------------------------------------------

google.charts.load('current', {packages: ['corechart', 'line']});
google.charts.setOnLoadCallback(drawChart);

function drawChart() {
    var data = new google.visualization.DataTable();
    data.addColumn('number', 'X');
    data.addColumn('number', 't = 50s');
    data.addColumn('number', 't = 25s');
    data.addColumn('number', 't = 20s');
    data.addColumn('number', 't = 15s');
    data.addColumn('number', 't = 10s');
    data.addColumn('number', 't = 5s');

    for(let j = 0; j < N + 1; j++) {
        data.addRows([
            [resultX[0][j]
            ,resultY[5][j]
            ,resultY[4][j]
            ,resultY[3][j]
            ,resultY[2][j]
            ,resultY[1][j]
            ,resultY[0][j]]
            ]);
    }

    var options = {
    hAxis: {
        title: 'r [ m ]',
        minValue: R_a,        
        format: 'decimal',
        gridlines: { count: 5 },
    },
    vAxis: {
        title: 'T [ °С ]',
        // viewWindow: { min: 100 },      
        format: 'decimal', // scientific
        gridlines: { count: 6 }
    },
    backgroundColor: 'white',
    };

    var chart = new google.visualization.LineChart(document.getElementById('curve_chart'));
    chart.draw(data, options);
}
