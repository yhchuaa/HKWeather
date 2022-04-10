var d = new Date();
var weekday = ["Sun", "Mon", "Tue", "Wed", "Thur", "Fri", "Sat"];
var a = 0;
var b = 5;
document.getElementById("left").style.display = "none";
function date(){
for (let i = 1; i <= 5; i++) {
  var week = `week${i}`;
  var date = `date${i}`;
  var x = d.getDay() + i + a;
  var y = d.getDate() + i + a;
  var z = d.getMonth() + 1;
  var max = new Date(0, 0, 0).getDate();
  if (y > max) {
    y = y - max;
    z = z + 1;
  }
  if (x >= weekday.length) {
    x = x - weekday.length;
  }
  document.getElementById(week).innerHTML = weekday[x];
  document.getElementById(date).innerHTML = y + "/" + z;
  if (i+a > 9) {
    document.getElementById(week).innerHTML = "";
    document.getElementById(date).innerHTML = "";
  }
}
}
date();
async function getObData() {
  return fetch("https://data.weather.gov.hk/weatherAPI/opendata/weather.php?dataType=rhrread&lang=en",
    { mode: 'cors' })
    .then(response => response.json());
}

async function getFwData() {
  return fetch("https://data.weather.gov.hk/weatherAPI/opendata/weather.php?dataType=fnd&lang=en",
    { mode: 'cors' })
    .then(response => response.json());
}

function getloc() {
  return new Promise((resolve, reject) => {
    function success(position) {
      let data = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };
      resolve(data);
    }
    function error() {
      reject("Unable to retrieve your location");
    }
    navigator.geolocation.getCurrentPosition(success, error);
  });
}

function getdistrict(pos) {
  return fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${pos.lat}&longitude=${pos.lng}&localityLanguage=en`,
    { mode: 'cors' }).then(response => response.json());
}

async function main() {
  try {
    var pos = await getloc();
  } catch (err) {
    console.log(err);
    var pos = null;
  }
  try {
    if (pos) {
      var addr = await getdistrict(pos);
    } else {
      var addr = null;
    }
  } catch (err) {
    console.log(err);
    var addr = null;
  }

  if (addr) {
    var area = addr.locality.slice(0, addr.locality.length - 9);
    document.getElementById("area").innerText = area;
  }
  try {
    var Odata = await getObData();
  } catch (err) {
    console.log(err);
    alert("Unable to retrieve weather data"); return;
  }
  try {
    var Fdata = await getFwData();
  } catch (err) {
    console.log(err);
    alert("Unable to retrieve weather data"); return;
  }

  var week = weekday[d.getDay()];
  var day = d.getDate();
  var mon = d.getMonth() + 1;
  var hour = d.getHours();
  var min = d.getMinutes();
  document.getElementById("h-info").innerHTML = day + "/" + mon + " " + hour + ":" + min + " " + week + " ";
  document.getElementById("icon").src = 'http://www.weather.gov.hk/images/HKOWxIconOutline/pic' + Odata.icon[0] + '.png';
  document.getElementById("h-humi").innerHTML = Odata.humidity.data[0].value + "<small>%</small>";

  for (let i = 0; i < Odata.temperature.data.length; i++) {
    var l = Odata.temperature.data[i].place.indexOf(area);

    if (-1 != l) {
      document.getElementById("h-temp").innerHTML = Odata.temperature.data[i].value + "<small>°C</small>";
      break;
    }
  }

  for (let i = 1; i <= 5; i++) {
    var maxtemp = `maxtemp${i}`;
    var mintemp = `mintemp${i}`;
    var fweather = `fweather${i}`;
    if (i+a > Fdata.weatherForecast.length) {
      document.getElementById(maxtemp).innerHTML = "";
      document.getElementById(mintemp).innerHTML = "";
      document.getElementById(fweather).style.display = "none";
    }else{
      document.getElementById(maxtemp).innerHTML = Fdata.weatherForecast[i-1+a].forecastMaxtemp.value + "<small>°C</small>";
      document.getElementById(mintemp).innerHTML = Fdata.weatherForecast[i-1+a].forecastMintemp.value + "<small>°C</small>";
      document.getElementById(fweather).style.display = "block";
      document.getElementById(fweather).src = 'http://www.weather.gov.hk/images/HKOWxIconOutline/pic' + Fdata.weatherForecast[i-1+a].ForecastIcon + '.png';
    }
  }

  for (let i = 0; i < 10; i++) {
    var name = `name${i + 1}`;
    var loctemp = `loctemp${i + 1}`;
    if (i + a*2 >= Odata.temperature.data.length) {
      document.getElementById(name).innerHTML = "";
      document.getElementById(loctemp).innerHTML = "";
    } else {
      document.getElementById(name).innerHTML = Odata.temperature.data[i + a*2].place;
      document.getElementById(loctemp).innerHTML = Odata.temperature.data[i + a*2].value + "<small>°C</small>";
    }
  }

  if (addr) {
    document.getElementById("h-rainfall").innerHTML = "<span id='rain'>0</span><small>mm</small>";
    Odata.rainfall.data[0].place = 'central and western district';
    for (place of Odata.rainfall.data) {
      let district = place.place.toLowerCase();
      if (!district.includes('district'))
        district = district + ' district';
      if (district == addr.locality.toLowerCase()) {
        let rainData = place.max;
        document.getElementById('rain').innerText = rainData;
      }
    }
  }
  date();
}
main();

function left(){
  if (a == 5) {
    document.getElementById("left").style.display = "none";
    document.getElementById("right").style.display = "block";
  } else {
    document.getElementById("right").style.display = "block";
  }
  a = a - 5;
  main();
}

function right(){
  if (a == b-5) {
    document.getElementById("right").style.display = "none";
    document.getElementById("left").style.display = "block";
  } else {
    document.getElementById("left").style.display = "block";
  }
  a = a + 5;
  main();
}

function district(){
  document.getElementById("locations").style.display = "grid";
  document.getElementById("days").style.display = "none";
  document.getElementById("left").style.display = "none";
  document.getElementById("right").style.display = "block";
  document.getElementById("chosen").style.transform = "translate(-100%)"
  a = 0;
  b = 10;
  main();
}

function future(){
  document.getElementById("locations").style.display = "none";
  document.getElementById("days").style.display = "grid";
  document.getElementById("left").style.display = "none";
  document.getElementById("right").style.display = "block";
  document.getElementById("chosen").style.transform = "translate(0)"
  a = 0;
  b = 5;
  main();
}