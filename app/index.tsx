import { useCallback, useEffect, useState } from 'react';
import {
  Text,
  View,
  Image,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { theme } from '../theme';
import { debounce, set } from 'lodash';
import {
  CalendarDaysIcon,
  MagnifyingGlassIcon,
} from 'react-native-heroicons/outline';
import * as Progress from 'react-native-progress';
import { MapPinIcon } from 'react-native-heroicons/solid';
import { fetchLocationWeather, fetchWeatherForecast } from '@/api/weather';
import { weatherImages } from '@/constants';

export default function Index() {
  const [showSearch, setShowSearch] = useState(false);
  const [locations, setLocations] = useState<
    { name: string; country: string }[]
  >([]);
  const [weather, setWeather] = useState<any>({});
  const [loading, setLoading] = useState(true);

  const handleLocation = async (loc: any) => {
    setLocations([]);
    setShowSearch(false);
    setLoading(true);
    const data = await fetchWeatherForecast({ cityName: loc.name, days: 7 });
    setWeather(data);
    setLoading(false);
  };

  const handleSearch = async (val: any) => {
    if (val.length > 2) {
      try {
        const data = await fetchLocationWeather({ cityName: val });
        setLocations(data);
      } catch (error) {
        console.error('Error fetching location data:', error);
      }
    }
  };

  useEffect(() => {
    fetchMyWeatherData();
  }, []);

  const fetchMyWeatherData = async () => {
    const data = await fetchWeatherForecast({ cityName: 'Bursa', days: 7 });
    setWeather(data);
    setLoading(false);
  };

  const handleTextDebounce = useCallback(debounce(handleSearch, 1200), []);

  const { current, location, forecast } = weather;

  return (
    <View className='flex-1 relative'>
      <Image
        blurRadius={70}
        source={require('../assets/images/bg.png')}
        className='absolute h-full w-full'
      />

      {loading ? (
        <View className='flex-1 flex-row justify-center items-center'>
          <Progress.CircleSnail thickness={10} size={140} color='#0bb3b2' />
        </View>
      ) : (
        <SafeAreaView className='flex flex-1'>
          <View className='mx-4 relative z-50' style={{ height: '7%' }}>
            {/* Search Bar */}
            <View
              className='flex-row justify-end items-center rounded-full'
              style={{
                backgroundColor: showSearch
                  ? theme.bgWhite(0.2)
                  : 'transparent',
              }}
            >
              {showSearch ? (
                <TextInput
                  onChangeText={handleTextDebounce}
                  placeholder='Search city'
                  placeholderTextColor={'lightgrey'}
                  className='pl-6 h-10 pb-1 flex-1 text-base text-white'
                />
              ) : null}

              <TouchableOpacity
                onPress={() => setShowSearch(!showSearch)}
                className='rounded-full p-3 m-1'
                style={{ backgroundColor: theme.bgWhite(0.3) }}
              >
                <MagnifyingGlassIcon size={25} color='white' />
              </TouchableOpacity>
            </View>

            {/* Location List */}
            {locations.length > 0 && showSearch ? (
              <View className='absolute w-full bg-gray-300 top-16 rounded-3xl'>
                {locations.map((item, index) => {
                  let showBorder = index + 1 != locations.length;
                  let borderClass = showBorder
                    ? 'border-b-2 border-b-gray-400'
                    : '';

                  return (
                    <TouchableOpacity
                      onPress={() => handleLocation(item)}
                      className={
                        'flex-row items-center border-0 p-3 px-4 mb-1 ' +
                        borderClass
                      }
                      key={index}
                    >
                      <MapPinIcon size={20} color='gray' />
                      <Text className='text-black text-lg ml-2'>
                        {item.name}, {item.country}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ) : null}
          </View>

          {/* Weather Info */}
          <View className='mx-4 flex justify-around flex-1 mb-2'>
            <Text className='text-white text-center text-2xl font-bold'>
              {location?.name},
              <Text className='text-lg font-semibold text-gray-300'>
                {' ' + location?.country}
              </Text>
            </Text>

            <View className='flex-row justify-center'>
              <Image
                source={
                  weatherImages[current?.condition?.text] ||
                  weatherImages['other']
                }
                className='w-52 h-52'
              />
            </View>

            <View className='space-y-2'>
              <Text className='text-center font-bold text-white text-6xl ml-5'>
                {current?.temp_c}&#176;
              </Text>
              <Text className='text-center text-white text-xl tracking-widest'>
                {current?.condition?.text}
              </Text>
            </View>

            <View className='flex-row justify-between mx-4'>
              <View className='flex-row space-x-2 items-center'>
                <Image
                  source={require('../assets/icons/wind.png')}
                  className='h-6 w-6'
                />
                <Text className='text-white font-semibold text-base'>
                  {' '}
                  {current?.wind_kph}km
                </Text>
              </View>

              <View className='flex-row space-x-2 items-center'>
                <Image
                  source={require('../assets/icons/drop.png')}
                  className='h-6 w-6'
                />
                <Text className='text-white font-semibold text-base'>
                  {' '}
                  {current?.humidity}%
                </Text>
              </View>

              <View className='flex-row space-x-2 items-center'>
                <Image
                  source={require('../assets/icons/sun.png')}
                  className='h-6 w-6'
                />
                <Text className='text-white font-semibold text-base'>
                  {' '}
                  {weather?.forecast?.forecastday[0]?.astro?.sunrise}
                </Text>
              </View>
            </View>
          </View>

          {/* Forecast for next days */}
          <View className='mb-2 space-y-3'>
            <View className='flex-row items-center mx-5 space-x-2 mb-5'>
              <CalendarDaysIcon size={22} color='white' />
              <Text className='text-white text-base'> Daily forecast</Text>
            </View>

            <ScrollView
              horizontal
              contentContainerStyle={{ paddingHorizontal: 15 }}
              showsHorizontalScrollIndicator={false}
            >
              {weather?.forecast?.forecastday?.map(
                (item: any, index: number) => {
                  let date = new Date(item.date);
                  let options: Intl.DateTimeFormatOptions = { weekday: 'long' };
                  let dayName = date.toLocaleDateString('en-US', options);
                  dayName = dayName.split(',')[0];

                  return (
                    <View
                      className='flex justify-center items-center w-24 rounded-3xl py-3 space-y-1 mr-4'
                      style={{ backgroundColor: theme.bgWhite(0.15) }}
                      key={index}
                    >
                      <Image
                        source={
                          weatherImages[item?.day?.condition?.text] ||
                          weatherImages['other']
                        }
                        className='h-11 w-11'
                      />
                      <Text className='text-white'>{dayName}</Text>
                      <Text className='text-white text-xl font-semibold'>
                        {item?.day?.avgtemp_c}&#176;
                      </Text>
                    </View>
                  );
                }
              )}
            </ScrollView>
          </View>
        </SafeAreaView>
      )}
    </View>
  );
}
