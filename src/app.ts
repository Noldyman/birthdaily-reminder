require("dotenv").config();
import { Birthday } from "./models/birthday";
import schedule from "node-schedule";

const env = {
  serverBaseUrl: process.env.SERVER_BASE_URL,
  homepageApiPort: process.env.HOMEPAGE_API_PORT,
  hassPort: process.env.HASS_PORT,
  hassAccessToken: process.env.HASS_ACCESS_TOKEN,
};

const getTodaysBirthdays = async (): Promise<Birthday[]> => {
  const response = await fetch(
    `${env.serverBaseUrl}:${env.homepageApiPort}/api/birthdays?interval=day`
  );
  const data: Birthday[] = await response.json();
  return data;
};

const sendBirthdayReminder = async () => {
  const birthdays = await getTodaysBirthdays();
  if (!birthdays.length) return;

  const payload = {
    title: "Birthdaily reminder",
    message: `Todays birthdays: ${birthdays.map((b) => `${b.name} (${b.newAge})`)}.`,
  };

  await fetch(`${env.serverBaseUrl}:${env.hassPort}/api/services/notify/mobile_app_iphone_6`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${env.hassAccessToken}`,
    },
    body: JSON.stringify(payload),
  });
};

const rule = new schedule.RecurrenceRule();
rule.hour = 9;
rule.minute = 30;
rule.tz = "Europe/Amsterdam";

schedule.scheduleJob(rule, sendBirthdayReminder);
