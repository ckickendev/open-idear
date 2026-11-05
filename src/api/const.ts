export const ENV = {
  ROOT_API: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001",
  ROOT_FRONTEND: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
};

export const CONST = ENV;

export default ENV;

