import { Handler } from "aws-lambda";
import { RequestOptions } from "https";
import * as AsyncHttp from "./asyncHttp";
import { publishNotification } from "./notification";
import * as Storage from "./storage";

const RELOAD_INTERVAL = 30 /* min */ * 60 /* sec */ * 1000 /* ms */;
const RUN_INTERVAL = 1.5 /* min */ * 60 /* sec */ * 1000 /* ms */;

const globalRegion = process.env.AWS_DEFAULT_REGION;

let statusMap: StatusMap = {};
let lastRun = 0;

let healthcheckConfig: HealthcheckConfig[] | null = null;
let lastLoadedConfig = 0;

interface StatusMap {
  [key: string]: {
    healthy: boolean;
    since: number;
  };
}

interface HealthcheckConfig {
  expectedContent: string;
  host: string;
  id: string;
  name: string;
  path: string;
  port: number;
  https?: boolean;
  topic: string;
}

const handleStatusChange =
  async (error: string | null, config: HealthcheckConfig) => {
    console.warn(`Saving error state for ${config.name}: ${error}`);
    const subject = ((!!error) ? "UNHEALTHY: " : "OK AGAIN: ") + config.name;
    const message = `${config.name} - ${config.host}${config.path}\nRegion: ${process.env.AWS_DEFAULT_REGION}\n\n`
      + ((!!error) ? error : "OK");

    publishNotification(subject, message, config.topic);

    statusMap[config.id] = {
      healthy: !!error,
      since: Date.now(),
    };
  };

const handleStatus =
  async (error: string | null, config: HealthcheckConfig) => {
    const healthy = (config.id in statusMap) ? statusMap[config.id].healthy : true;

    const statusChanged = healthy !== !!error;
    if (statusChanged) {
      await handleStatusChange(error, config);
    }
    return Promise.resolve(statusChanged);
  };

const checkHealth = async (config: HealthcheckConfig) => {
  const options: RequestOptions = {
    hostname: config.host,
    method: "GET",
    path: config.path,
    port: !!config.port ? config.port : (config.https === false ? 80 : 443),
    protocol: (config.https === false) ? "http:" : "https:",
    timeout: 5000,
  };
  try {
    await AsyncHttp.lookup(config.host);

    const httpResponse = await AsyncHttp.request(options);

    console.log(config.host + config.path + " " + httpResponse.code + " " + httpResponse.latencyMs + "ms");

    if (httpResponse.code !== 200) {
      return handleStatus("Wrong return code: " + httpResponse.code, config);
    }
    if (httpResponse.body.indexOf(config.expectedContent) < 0) {
      return handleStatus("Wrong content: " + httpResponse.body, config);
    } else {
      return handleStatus(null, config);
    }
  } catch (err) {
    return handleStatus(err.message, config);
  }
};

export const healthcheck: Handler = async (event: any) => {
  if (!healthcheckConfig || Date.now() - lastLoadedConfig > RELOAD_INTERVAL) {
    healthcheckConfig = await Storage.loadObject("config.json", null) as HealthcheckConfig[];
    lastLoadedConfig = Date.now();
  }

  if (!statusMap || Date.now() - lastRun > RUN_INTERVAL) {
    statusMap = await Storage.loadObject("status.json", {}) as StatusMap;
  }

  if (!statusMap || !healthcheckConfig) {
    return Promise.reject("Failed to load data");
  }

  lastRun = Date.now();
  const results = await Promise.all(healthcheckConfig.map(checkHealth));
  if (results.indexOf(true) >= 0) {
    await Storage.saveObject("status.json", statusMap);
  }
};
