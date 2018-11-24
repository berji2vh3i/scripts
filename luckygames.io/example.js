$('#gameContainer').html('<div id="chart"></div>');
$('#gameContainer').css('width', '1000px');
$('#gameContainer').css('margin', 'auto');
let run = false;
let chance, basebet, nextbet, bethigh;
let bet, win, lose, balance, profit;
let dps, chart, color;
let overbalance, underbalance;
let drawChart = () => {
  $.getScript('https://canvasjs.com/assets/script/canvasjs.min.js').done((script, textStatus) => {
    dps = [{
      x: 0,
      y: 0
    }];
    chart = new CanvasJS.Chart('chart', {
      theme: 'light2',
      zoomEnabled: true,
      axisX: {
        title: '',
        includeZero: false,
      },
      axisY: {
        title: '',
        includeZero: false,
      },
      title: {
        text: '',
      },
      data: [{
        type: 'stepLine',
        dataPoints: dps
      }]
    });
    chart.render();
  });
  setTimeout(() => {
    start();
  }, 1e3);
}
let renderChart = () => {
  dps.push({
    x: bet,
    y: profit,
    color: color
  })
  if (dps[dps.length - 2]) {
    dps[dps.length - 2].lineColor = color;
  }
  if (dps.length > 1000) {
    dps.shift();
  }
  chart.render();
}
let renderStatic = () => {
  console.clear();
  console.log('Balance = ' + balance);
  console.log('Profit = ' + profit.toFixed(8));
  console.log('Bet = ' + bet);
  console.log('Win = ' + win);
  console.log('Lose = ' + lose);
}
let reset = () => {
  run = false;
  chance = 50;
  basebet = prompt('Input base bet', '0.00000000');
  overbalance = prompt('Input over balance', '0.00000000');
  underbalance = prompt('Input under balance', '0.00000000');
  nextbet = basebet;
  bethigh = true;
  bet = 0;
  win = 0;
  lose = 0;
  balance = $('#balance').val();
  profit = 0;
  randomizeSeed();
}
let start = () => {
  reset();
  setTimeout(() => {
    run = true;
    dobet();
  }, 1e3);
}
let stop = () => {
  run = false;
  console.log('Stopped');
}
let dobet = () => {
  let direction, prediction = chance, clientSeed = $('#clientSeed').val(), serverSeedHash = $('#serverSeedHash').html();
  bethigh == true ? direction = 'over' : direction = 'under';
  if (run == true) {
    $.post('https://luckygames.io/play/', {
      game: 'dice',
      coin: $('#coin').val(),
      betAmount: nextbet,
      prediction: prediction,
      direction: direction,
      clientSeed: clientSeed,
      serverSeedHash: serverSeedHash,
      hash: user.hash
    }, (data) => {
      let result = JSON.parse(data);
      if (result.result != true) {
        randomizeSeed();
        setTimeout(() => {
          dobet();
        }, 1e3);
      }
      else {
        $('#serverSeedHash').html(result.serverSeedHash);
        bet += 1;
        balance = result.balance;
        profit += parseFloat(result.profit);
        if (result.gameResult == 'win') {
          color = 'green';
          win += 1;
        }
        else {
          color = 'red';
          lose += 1;
        }
        renderChart();
        renderStatic();
        if (overbalance != 0 && balance >= overbalance) {
          stop();
          console.log('Over balance');
        }
        else if (underbalance != 0 && balance <= underbalance) {
          stop();
          console.log('Under balance');
        }
        else {
          if (result.gameResult == 'win') {
            nextbet = basebet;
          }
          else {
            nextbet *= 2;
          }
          setTimeout(() => {
            dobet();
          }, 1e2);
        }
      }
    });
  }
  else {
    console.log('Run is false');
  }
}
setTimeout(() => {
  drawChart();
}, 1e2);
