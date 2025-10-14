/*  navigator.geolocation.getCurrentPosition(pos => {
  const { latitude, longitude } = pos.coords;
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather`;

  fetch(url)
    .then(res => res.json())
    .then(data => console.log("Your weather:", data.current_weather));
}); */

const currentDate = document.getElementById('currentDate')

async function fetchWeather(lat, lon, units = {}) {
    const { temperature, wind, precipitation } = units
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=weather_code,temperature_2m_max,temperature_2m_min&hourly=temperature_2m,weather_code&current=temperature_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,relative_humidity_2m&temperature_unit=${temperature}&wind_speed_unit=${wind}&precipitation_unit=${precipitation}&timezone=auto
`

    const res = await fetch(url)
    const data = await res.json()

    return {
        current: data.current,
        current_units: data.current_units,
        hourly: data.hourly,
        hourly_units: data.hourly_units,
        daily: data.daily,
        daily_units: data.daily_units,
    }
}

function formatLocalizedDate(timeString) {
    const userLocale = navigator.language || 'en-US'
    const date = new Date(timeString)

    return new Intl.DateTimeFormat(userLocale, {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    }).format(date)
}

function getWeatherIconAndDescription(code) {
    // Basstruktur med ikoner + textbeskrivningar
    const map = {
        // ☀️ Clear
        0: { icon: 'sunny', text: 'Clear sky' },

        // 🌤️ Partly cloudy / overcast
        1: { icon: 'partly-cloudy', text: 'Mainly clear' },
        2: { icon: 'partly-cloudy', text: 'Partly cloudy' },
        3: { icon: 'overcast', text: 'Overcast' },

        // 🌫️ Fog
        45: { icon: 'fog', text: 'Fog' },
        48: { icon: 'fog', text: 'Depositing rime fog' },

        // 🌦️ Drizzle
        51: { icon: 'drizzle', text: 'Light drizzle' },
        53: { icon: 'drizzle', text: 'Moderate drizzle' },
        55: { icon: 'drizzle', text: 'Dense drizzle' },
        56: { icon: 'drizzle', text: 'Freezing drizzle (light)' },
        57: { icon: 'drizzle', text: 'Freezing drizzle (dense)' },

        // 🌧️ Rain
        61: { icon: 'rain', text: 'Light rain' },
        63: { icon: 'rain', text: 'Moderate rain' },
        65: { icon: 'rain', text: 'Heavy rain' },
        66: { icon: 'rain', text: 'Freezing rain (light)' },
        67: { icon: 'rain', text: 'Freezing rain (heavy)' },

        // ❄️ Snow
        71: { icon: 'snow', text: 'Slight snow fall' },
        73: { icon: 'snow', text: 'Moderate snow fall' },
        75: { icon: 'snow', text: 'Heavy snow fall' },
        77: { icon: 'snow', text: 'Snow grains' },
        85: { icon: 'snow', text: 'Snow showers (slight)' },
        86: { icon: 'snow', text: 'Snow showers (heavy)' },

        // 🌧️ Showers
        80: { icon: 'rain', text: 'Slight rain showers' },
        81: { icon: 'rain', text: 'Moderate rain showers' },
        82: { icon: 'rain', text: 'Violent rain showers' },

        // 🌩️ Thunderstorm
        95: { icon: 'storm', text: 'Thunderstorm (moderate)' },
        96: { icon: 'storm', text: 'Thunderstorm (slight hail)' },
        99: { icon: 'storm', text: 'Thunderstorm (heavy hail)' },
    }
    // Get data from the map, or fallback
    const weather = map[code] || { icon: 'unknown', text: 'Unknown' }

    // Create the <img>
    const weatherIcon = document.createElement('img')
    weatherIcon.src = `/assets/images/icon-${weather.icon}.webp`
    weatherIcon.alt = weather.text
    weatherIcon.className = 'weather-icon'
    return weatherIcon
}

function createWeatherDivs(data, units) {
    const container = document.getElementById('weather-details')
    container.innerHTML = ''
    // Helper to create one weather item div
    function createItem(label, value, unit) {
        const itemDiv = document.createElement('div')
        itemDiv.className = 'weather-item'

        const labelP = document.createElement('p')
        labelP.className = 'weather-label'
        labelP.textContent = label

        const valueP = document.createElement('p')
        valueP.className = 'weather-value'
        valueP.textContent = `${value}${unit}`

        itemDiv.append(labelP, valueP)

        return itemDiv
    }
    container.append(
        createItem(
            'Feels like',
            data.apparent_temperature,
            units.apparent_temperature
        ),
        createItem(
            'Humidity',
            data.relative_humidity_2m,
            units.relative_humidity_2m
        ),
        createItem('Wind', data.wind_speed_10m, ` ${units.wind_speed_10m}`),
        createItem(
            'Precipitation',
            data.precipitation,
            ` ${units.precipitation}`
        )
    )

    return container
}

function displayDegrees(data) {
    const temp = document.createElement('p')
    temp.textContent = `${data}°`
    temp.classList.add('temperature')
    return temp
}

function renderCurrent(current, units) {
    const container = document.getElementById('degrees')
    container.innerHTML = ''
    currentDate.textContent = formatLocalizedDate(current.time)
    // console.log(current)
    getWeatherIconAndDescription(current.weather_code)
    container.append(getWeatherIconAndDescription(current.weather_code))
    const temp = document.createElement('p')
    temp.textContent = `${current.temperature_2m}°`
    temp.classList.add('temperature')
    container.append(temp)
    createWeatherDivs(current, units)
    // console.log(units)
}

function renderDaily(daily) {
    const container = document.querySelector('.daily-forecast')
    container.innerHTML = ''
    // console.log(daily)
    daily.time.forEach((date, i) => {
        const div = document.createElement('div')
        div.classList.add('weather-item')

        const dateP = document.createElement('p')
        dateP.textContent = new Date(date).toLocaleDateString(undefined, {
            weekday: 'short',
        })
        div.append(dateP)
        div.append(getWeatherIconAndDescription(daily.weather_code[i]))

        const temperatures = document.createElement('div')
        temperatures.classList.add('row')

        temperatures.append(displayDegrees(daily.temperature_2m_max[i]))
        const low = displayDegrees(daily.temperature_2m_min[i])
        low.classList.add('low')
        temperatures.append(low)
        div.append(temperatures)
        container.append(div)
        // console.log(date, i)
    })
}

function groupHourlyByDay(hourly) {
    const combined = hourly.time.map((t, i) => ({
        time: new Date(t),
        temperature: hourly.temperature_2m[i],
        weather_code: hourly.weather_code[i],
    }))

    const grouped = Object.groupBy(combined, (entry) =>
        entry.time.toLocaleDateString(undefined, { weekday: 'long' })
    )

    return grouped
}

let groupedData = null // global variabel för data

const weekdaySelect = document.getElementById('weekdays')

weekdaySelect.addEventListener('change', (e) => {
    const selectedDay = e.target.value
    if (groupedData && groupedData[selectedDay]) {
        renderHourlyForDay(groupedData[selectedDay])
    }
})

function renderHourly(hourly) {
    const grouped = groupHourlyByDay(hourly)
    groupedData = grouped
    const weekdaySelect = document.getElementById('weekdays')
    weekdaySelect.innerHTML = ''

    Object.keys(grouped).forEach((day) => {
        const dayOpt = document.createElement('option')
        dayOpt.textContent = day
        dayOpt.value = day
        weekdaySelect.append(dayOpt)
    })

    const firstDay = Object.keys(grouped)[0]
    if (firstDay) {
        weekdaySelect.value = firstDay
        renderHourlyForDay(grouped[firstDay])
    }
    /* console.log('eventlistener'); */

    /*  weekdaySelect.addEventListener('change', (e) => {
    console.log(e);

        const selectedDay = e.target.value
        renderHourlyForDay(grouped[selectedDay])
    }) */
    // console.log(hourly)

    // Alla timmar för måndag
    // console.log(grouped['Monday'])
    // console.log(weekdaySelect)
}

function renderHourlyForDay(entries) {
    const container = document.getElementById('hourly-container')
    container.innerHTML = '' // töm gammalt innehåll

    entries.forEach(({ time, temperature, weather_code }) => {
        const item = document.createElement('div')
        item.className = 'hour-item'

        const timeP = document.createElement('p')
        // console.log(time);

        timeP.textContent = time.toLocaleTimeString([], {
            hour: 'numeric',
            minute: '2-digit',
        })

        item.append(
            getWeatherIconAndDescription(weather_code),
            timeP,
            displayDegrees(temperature)
        )
        container.append(item)
    })
    // console.log(entries)
}
const unitOptions = document.querySelectorAll('.unit-option')
unitOptions.forEach((element) => {
    const icon = document.createElement('img')
    icon.src = '/assets/images/icon-checkmark.svg'
    icon.alt = 'checkmark'
    icon.classList.add('icon')
    element.append(icon)
})

// Standardenheter (metric)
const units = {
    temperature: 'celsius',
    wind: 'kmh',
    precipitation: 'mm',
}

const unitInputs = document.querySelectorAll('.unit-option input[type="radio"]')

unitInputs.forEach((input) => {
    input.addEventListener('change', async () => {
        const type = input.name
        const value = input.value

        units[type] = value

        // Hämta nytt väder med valda enheter
        const { current, hourly, daily, current_units } = await fetchWeather(
            59.33,
            18.06,
            units
        )
        renderCurrent(current, current_units)
        renderHourly(hourly)
        renderDaily(daily)
    })
})

// Sedan kan du rendera:
fetchWeather(59.33, 18.06, units).then(
    ({ current, current_units, hourly, daily }) => {
        renderCurrent(current, current_units)
        renderHourly(hourly)
        renderDaily(daily)
    }
)

const btn = document.getElementById('unitBtn')
const menu = document.getElementById('unitMenu')

// Öppna/stäng meny
btn.addEventListener('click', () => {
    menu.classList.toggle('show')
})

const searchResults = document.getElementById('search-results')
searchResults.innerHTML = 'Searching...'

document.querySelector('form').addEventListener('submit', async function (e) {
    e.preventDefault()
    const city = document.getElementById('place').value.trim()
    if (!city) return

    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
        city
    )}&count=5&language=en&format=json`

    try {
        const res = await fetch(url)
        const data = await res.json()
        console.log('something happened')

        searchResults.innerHTML = ''
        if (data.results && data.results.length > 0) {
            data.results.forEach((place) => {
                console.log(place)
                const option = document.createElement('li')
                option.className = 'search-result-item'
                option.textContent = `${place.name}, ${place.country}`
                option.addEventListener('click', async (event) => {
                    console.log('Result clicked')
                    event.stopPropagation()
                    // Fetch and render weather for selected location
                    const { current, hourly, daily, current_units } =
                        await fetchWeather(
                            place.latitude,
                            place.longitude,
                            units
                        )
                    renderCurrent(current, current_units)
                    renderHourly(hourly)
                    renderDaily(daily)

                    // Optionally update city name in UI
                    document.querySelector(
                        '#widget h2'
                    ).textContent = `${place.name}, ${place.country}`
                    // searchResults.innerHTML = ''
                })
                searchResults.append(option)
                searchResults.classList.toggle('show')
            })
            // const { latitude, longitude, name, country } = data.results[0];
            // Use latitude and longitude as needed
            // console.log(`Lat: ${latitude}, Lon: ${longitude}, City: ${name}, Country: ${country}`);
            // Example: update UI or fetch weather data here
        } else {
            searchResults.innerHTML = 'No results found.'
        }
    } catch (err) {
        searchResults.innerHTML = 'Error fetching locations.'
    }
})

const searchArea = document.getElementById('search-area')

// Optional: Hide results when clicking outside
document.addEventListener('click', (e) => {
    console.log('Document clicked', e.target)
    if (!searchArea.contains(e.target)) {
        searchResults.innerHTML = ''
        searchResults.classList.toggle('show')
    }
})
