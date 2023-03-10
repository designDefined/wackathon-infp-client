import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { TLLCoordinates } from "../../types/locationTypes";
import { useMyPositionStore } from "../../../store/useMyPositionStore";

export const useGetCurrentLocation = (options: PositionOptions = {}) => {
  // if (!navigator.geolocation) {
  //   throw "위치 정보가 지원되지 않습니다.";
  // }
  const [coordinates, setCoordinates] = useState<TLLCoordinates>();
  const [errorMsg, setErrorMsg] = useState<string>();

  const handleSuccess = ({ coords }: { coords: GeolocationCoordinates }) => {
    const { latitude: lat, longitude: lon } = coords;
    setCoordinates({ lat, lon });
  };
  const handleError = (error: GeolocationPositionError) => {
    setErrorMsg(error.message);
  };

  useLayoutEffect(() => {
    navigator.geolocation.getCurrentPosition(handleSuccess, handleError, options);
  }, [handleError, handleSuccess, options]);

  // return { coordinates, errorMsg }; TODO: 추후 error handling 시 수정
  return coordinates;
};

export const useWatchLocation = (options = {}) => {
  const [coordinates, setCoordinates] = useState<TLLCoordinates>();
  const [heading, setHeading] = useState<number | null>();
  const [error, setError] = useState<string>();
  const locationWatchId = useRef<number | null>(null);

  const handleSuccess = ({ coords }: { coords: GeolocationCoordinates }) => {
    const { latitude: lat, longitude: lon, heading: direction } = coords;
    // setCenter({ lat, lon });
    setCoordinates({ lat, lon });
    setHeading(direction);
  };

  const handleError = (error: GeolocationPositionError) => {
    setError(error.message);
  };

  // 저장된 `watchPosition` ID를 기반으로 감시 인스턴스를 지웁니다.
  const cancelLocationWatch = () => {
    const { geolocation } = navigator;
    if (locationWatchId.current && geolocation) {
      geolocation.clearWatch(locationWatchId.current);
    }
  };

  useEffect(() => {
    locationWatchId.current = navigator.geolocation.watchPosition(
      handleSuccess,
      handleError,
      options
    );
    return cancelLocationWatch;
  }, [options]);

  return { coordinates, heading, cancelLocationWatch, error };
};

export const useIntervalToGetLocation = (options = {}) => {
  const handleSuccess = ({ coords }: { coords: GeolocationCoordinates }) => {
    const { latitude: lat, longitude: lon, heading } = coords;
    useMyPositionStore.setState({ currentCoordinates: { lat, lon } });
    useMyPositionStore.setState({ heading });
  };
  const handleError = () => {
    console.log("error");
  };
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(handleSuccess, handleError, options);
    setInterval(() => {
      navigator.geolocation.getCurrentPosition(handleSuccess, handleError, options);
    }, 5000);
  }, []);
};
