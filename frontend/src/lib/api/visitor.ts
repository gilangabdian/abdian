

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const logVisitor = async (deviceId: string, locationData: any = {}) => {
  return await fetch(`${API_URL}/visitors`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({ device_id: deviceId, ...locationData }),
  });
};

export const getVisitorCount = async (token: string) => {
  return await fetch(`${API_URL}/admin/visitors/count`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
  });
};

export const adminGetVisitors = async (token: string, page: number = 1) => {
  return await fetch(`${API_URL}/admin/visitors?page=${page}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
  });
};

export const adminDeleteVisitor = async (token: string, id: string | number) => {
  return await fetch(`${API_URL}/admin/visitors/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
  });
};

export const adminClearAllVisitors = async (token: string) => {
  return await fetch(`${API_URL}/admin/visitors`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
  });
};

export const getVisitorMarkCount = async (deviceId?: string) => {
  const url = deviceId 
    ? `${API_URL}/visitors/mark/count?device_id=${deviceId}`
    : `${API_URL}/visitors/mark/count`;
  return await fetch(url, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    }
  });
};

export const leaveVisitorMark = async (deviceId: string) => {
  return await fetch(`${API_URL}/visitors/mark`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({ device_id: deviceId }),
  });
};

export const getGeoJSLocation = async () => {
  return await fetch("https://get.geojs.io/v1/ip/geo.json", {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    }
  });
};
