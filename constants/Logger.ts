import Toast from 'react-native-simple-toast'

import { AppSettings, Global } from './GlobalValues'
import { mmkv } from './MMKV'
import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';

import getSystemLanguage from "../app/language-utils";

import translationEN from "../app/locales/en.json";
import translationPL from "../app/locales/pl.json";

// Define the type for the resources object
const resources = {
  en: {
    translation: translationEN,
  },
  pl: {
    translation: translationPL,
  },
} as const; // `as const` ensures the keys are readonly literals

type LanguageKeys = keyof typeof resources; // Extract valid keys from resources

// Type guard to validate if a string is a valid key
function isLanguageKey(key: string): key is LanguageKeys {
  return key in resources;
}

const systemLanguage = getSystemLanguage();
const fallbackLanguage: LanguageKeys = "en"; // Define fallback language

// Validate the system language
const selectedLanguage = isLanguageKey(systemLanguage) ? systemLanguage : fallbackLanguage;

// Initialize i18next
i18next
  .use(initReactI18next)
  .init({
    resources,
    lng: selectedLanguage, // Use validated language or fallback
    interpolation: {
      escapeValue: false, // React already escapes values
    }
  });

export namespace Logger {
    const toastTime = 2000

    export enum LogLevel {
        INFO,
        WARN,
        ERROR,
        DEBUG,
    }

    const LevelName: Record<LogLevel, string> = {
        [LogLevel.INFO]: '[INFO]',
        [LogLevel.WARN]: '[WARN]',
        [LogLevel.ERROR]: '[ERROR]',
        [LogLevel.DEBUG]: '[DEBUG]',
    }

    type Log = {
        timestamp: string
        message: string
        level: LogLevel
    }

    const maxloglength = 300

    const getLogs = () => {
        return JSON.parse(mmkv.getString(Global.Logs) ?? '[]')
    }

    const insertToLogs = (data: string) => {
        const logs = getLogs()
        logs.push(data)
        if (logs.length > maxloglength) logs.shift()
        mmkv.set(Global.Logs, JSON.stringify(logs))
    }

    export const log = (data: string, toast: boolean = false, toastTime: number = 2000) => {
        const translatedMessage = i18next.exists(data.split(":")[0]) ? i18next.t(data.split(":")[0]) : data;
        const timestamped = `[${new Date().toTimeString().substring(0, 8)}] : ${data}`;
        console.log(timestamped);
        insertToLogs(timestamped);
        if (data.split(":").length > 1){
            if (toast) Toast.show(`${translatedMessage}${data.substring(data.split(":")[0].length,data.length)}`, toastTime);
        }
        else{
            if (toast) Toast.show(translatedMessage, toastTime);
        }
    }

    export const debug = (data: string) => {
        if (__DEV__ || mmkv.getBoolean(AppSettings.DevMode)) {
            insertToLogs(data)
            console.log(`[Debug]: `, data)
        }
    }

    export const flushLogs = () => {
        mmkv.set(Global.Logs, '[]')
    }

    // new api

    const insertLogs = (data: Log) => {
        const logs = getLogs()
        logs.push(data)
        if (logs.length > maxloglength) logs.shift()
        mmkv.set(Global.Logs, JSON.stringify(logs))
    }

    const createLog = (data: string, level: LogLevel): Log => {
        const timestamp = `[${new Date().toTimeString().substring(0, 8)}]`
        return { timestamp: timestamp, message: data, level: level }
    }

    const printLog = (log: Log) => {
        console.log(`${LevelName[log.level]}${log.timestamp}: ${log.message}`)
    }

    export const info = (data: string) => {
        const logItem = createLog(data, LogLevel.INFO)
        printLog(logItem)
        insertLogs(logItem)
    }

    export const infoToast = (data: string) => {
        info(data)
        Toast.show(data, toastTime)
    }

    export const warn = (data: string) => {
        const logItem = createLog(data, LogLevel.WARN)
        printLog(logItem)
        insertLogs(logItem)
    }

    export const warnToast = (data: string) => {
        warn(data)
        Toast.show(data, toastTime)
    }

    export const error = (data: string) => {
        const logItem = createLog(data, LogLevel.ERROR)
        printLog(logItem)
        insertLogs(logItem)
    }

    export const errorToast = (data: string) => {
        error(data)
        Toast.show(data, toastTime)
    }

    export const newDebug = (data: string) => {
        const logItem = createLog(data, LogLevel.DEBUG)
        printLog(logItem)
        insertLogs(logItem)
    }

    export const debugToast = (data: string) => {
        error(data)
        Toast.show(data, toastTime)
    }
}
