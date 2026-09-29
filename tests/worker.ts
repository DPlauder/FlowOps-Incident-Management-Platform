import { GET } from "../src/app/api/health/route";

const worker = {
  async fetch() {
    return GET();
  },
};

export default worker;