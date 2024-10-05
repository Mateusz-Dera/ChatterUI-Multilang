import { rawdb } from '@db'
import { copyFile, DocumentDirectoryPath, DownloadDirectoryPath } from '@dr.pogodin/react-native-fs'
import { Style, AppSettings, Logger, Characters } from '@globals'
import appConfig from 'app.config'
import { reloadAppAsync } from 'expo'
import { getDocumentAsync } from 'expo-document-picker'
import { documentDirectory, copyAsync, deleteAsync } from 'expo-file-system'
import { Stack, useRouter } from 'expo-router'
import React from 'react'
import { StyleSheet, Text, View, Switch, TouchableOpacity, Alert, ScrollView } from 'react-native'
import { useMMKVBoolean } from 'react-native-mmkv'
import { Trans, useTranslation } from 'react-i18next'

const appVersion = appConfig.expo.version

type SwitchComponentProps = {
    title: string
    value: boolean | undefined
    onValueChange: (b: boolean) => void | Promise<void> | undefined
}

const SwitchComponent: React.FC<SwitchComponentProps> = ({ title, value, onValueChange }) => {
    return (
        <View style={{ flexDirection: 'row', paddingVertical: 12 }}>
            <Switch
                trackColor={{
                    false: Style.getColor('primary-surface1'),
                    true: Style.getColor('primary-surface3'),
                }}
                thumbColor={
                    value ? Style.getColor('primary-brand') : Style.getColor('primary-surface3')
                }
                ios_backgroundColor="#3e3e3e"
                onValueChange={onValueChange}
                value={value}
            />
            <Text
                style={{
                    marginLeft: 16,
                    color: Style.getColor(value ? 'primary-text1' : 'primary-text3'),
                }}>
                <Trans>{title}</Trans>
            </Text>
        </View>
    )
}

const WarningAlert = (title: string, description: string, cancel: string, confirm: string, onPress: () => void) => {
    Alert.alert(title, description, [
        { text: cancel, style: `cancel` },
        {
            text: confirm,
            style: `destructive`,
            onPress: onPress,
        },
    ])
}

const exportDB = async () => {
    await copyFile(
        `${DocumentDirectoryPath}/SQLite/db.db`,
        `${DownloadDirectoryPath}/${appVersion}-db-backup.db`
    )
        .then(() => {
            Logger.log('Download Successful!', true)
        })
        .catch((e) => Logger.log('Failed to copy database: ' + e, true))
}

const importDB = async (uri: string, name: string, title: string, message: string, cancel: string, confirm: string) => {
    const copyDB = async () => {
        rawdb.closeSync()
        await exportDB()
        await deleteAsync(`${documentDirectory}SQLite/db.db`).catch(() => {
            Logger.debug('Somehow the db is already deleted')
        })
        await copyAsync({
            from: uri,
            to: `${documentDirectory}SQLite/db.db`,
        }).then(() => {
            Logger.log('Copy Successful, Restarting now.')
            reloadAppAsync()
        })
    }

    const dbAppVersion = name.split('-')[0]
    if (dbAppVersion !== appVersion) {
        WarningAlert(
            title,
            message.replace('${dbAppVersion}', dbAppVersion).replace('${appVersion}', appVersion),
            cancel,
            confirm,
            copyDB
        )
    } else copyDB()
}

const AppSettingsMenu = () => {
    const { t } = useTranslation()
    const router = useRouter()
    //const [animateEditor, setAnimateEditor] = useMMKVBoolean(AppSettings.AnimateEditor)
    const [saveKV, setSaveKV] = useMMKVBoolean(AppSettings.SaveLocalKV)
    const [printContext, setPrintContext] = useMMKVBoolean(AppSettings.PrintContext)
    const [firstMes, setFirstMes] = useMMKVBoolean(AppSettings.CreateFirstMes)
    const [chatOnStartup, setChatOnStartup] = useMMKVBoolean(AppSettings.ChatOnStartup)
    const [autoloadLocal, setAutoloadLocal] = useMMKVBoolean(AppSettings.AutoLoadLocal)
    const [autoScroll, setAutoScroll] = useMMKVBoolean(AppSettings.AutoScroll)
    const [sendOnEnter, setSendOnEnter] = useMMKVBoolean(AppSettings.SendOnEnter)

    return (
        <ScrollView style={styles.mainContainer}>
            <Stack.Screen options={{ title: t('App Settings') }} />

            <Text style={{ ...styles.sectionTitle, paddingTop: 0 }}><Trans>Style</Trans></Text>
            {/* Removed as this animation is buggy on Samsung devices, now defaults to no animation */}
            {/*<SwitchComponent
                title="Animate Editor"
                value={animateEditor}
                onValueChange={setAnimateEditor}
            />

            <Text style={styles.subtitle}>
                This will skip the popup animation on the chat editor for compatibility on certain
                devices. Enable if you are experience weird chat editor behavior
            </Text>*/}

            <TouchableOpacity
                style={styles.button}
                onPress={() => {
                    router.push('/ColorSettings')
                }}>
                <Text style={styles.buttonText}><Trans>Customize Colors</Trans></Text>
            </TouchableOpacity>

            <Text style={styles.sectionTitle}><Trans>Chat</Trans></Text>

            <SwitchComponent title="Auto Scroll" value={autoScroll} onValueChange={setAutoScroll} />
            <Text style={styles.subtitle}><Trans>Autoscrolls text during generations</Trans></Text>

            <SwitchComponent
                title="Use First Message"
                value={firstMes}
                onValueChange={setFirstMes}
            />
            <Text style={styles.subtitle}>
                <Trans>This will make new chats start blank, needed by specific models</Trans>
            </Text>

            <SwitchComponent
                title="Load Chat On Startup"
                value={chatOnStartup}
                onValueChange={setChatOnStartup}
            />
            <Text style={styles.subtitle}><Trans>Loads the most recent chat on startup</Trans></Text>

            <SwitchComponent
                title="Send on Enter"
                value={sendOnEnter}
                onValueChange={setSendOnEnter}
            />
            <Text style={styles.subtitle}><Trans>Submits messages when Enter is pressed</Trans></Text>

            <Text style={styles.sectionTitle}><Trans>Generation</Trans></Text>

            <SwitchComponent
                title="Load Local Model on Chat"
                value={autoloadLocal}
                onValueChange={setAutoloadLocal}
            />
            <Text style={styles.subtitle}>
                <Trans>Automatically loads most recently used local model when chatting</Trans>
            </Text>

            <SwitchComponent title="Save Local KV" value={saveKV} onValueChange={setSaveKV} />
            <Text style={styles.subtitle}>
                <Trans>Saves the KV cache on generations, allowing you to continue sessions after closing the app. </Trans> 
                <Trans>You must use the same model for this to function properly. </Trans> 
                <Trans>Be warned that the KV cache file may be very big and negatively impact battery life!</Trans>
            </Text>

            <SwitchComponent
                title="Print Context"
                value={printContext}
                onValueChange={setPrintContext}
            />
            <Text style={styles.subtitle}><Trans>Prints the generation context to logs for debugging</Trans></Text>

            <Text style={styles.sectionTitle}><Trans>Character Management</Trans></Text>
            <TouchableOpacity
                style={styles.button}
                onPress={() => {
                    WarningAlert(
                        t(`Regenerate Default Card`),
                        t(`This will add the default AI Bot card to your character list.`),
                        t('Cancel'),
                        t('Confirm'),
                        Characters.createDefaultCard
                    )
                }}>
                <Text style={styles.buttonText}><Trans>Regenerate Default Card</Trans></Text>
            </TouchableOpacity>

            <Text style={styles.sectionTitle}><Trans>Database Management</Trans></Text>
            <Text style={styles.subtitle}>
                <Trans>WARNING: only import if you are certain it's from the same version!</Trans>
            </Text>
            <TouchableOpacity
                style={styles.button}
                onPress={() => {
                    WarningAlert(
                        t(`Export Database`),
                        t(`Are you sure you want to export the database file?\n\nIt will automatically be downloaded to Downloads`),
                        t('Cancel'),
                        t('Confirm'),
                        exportDB
                    )
                }}>
                <Text style={styles.buttonText}><Trans>Export Database</Trans></Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.button}
                onPress={async () => {
                    getDocumentAsync({ type: ['application/*'] }).then(async (result) => {
                        if (result.canceled) return
                        WarningAlert(
                            t(`Import Database`),
                            t(`Are you sure you want to import this database? This may will destroy the current database!\n\nA backup will automatically be downloaded.\n\nApp will restart automatically`),
                            t('Cancel'),
                            t('Confirm'),
                            () => importDB(
                                result.assets[0].uri, 
                                result.assets[0].name,
                                t('WARNING: Different Version'),
                                t("The imported database file has a different app version (${dbAppVersion}) than installed (${appVersion}), this may break or corrupt the database. It is recommended to use the same app version."),
                                t('Cancel'),
                                t('Confirm') 
                            )
                        )
                    })
                }}>
                <Text style={styles.buttonText}><Trans>Import Database</Trans></Text>
            </TouchableOpacity>
            <View style={{ paddingVertical: 60 }} />
        </ScrollView>
    )
}

export default AppSettingsMenu

const styles = StyleSheet.create({
    mainContainer: {
        marginTop: 16,
        paddingHorizontal: 20,
        paddingBottom: 20,
    },

    button: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        backgroundColor: Style.getColor('primary-surface3'),
        borderRadius: 8,
        marginVertical: 8,
    },

    buttonText: {
        color: Style.getColor('primary-text1'),
    },

    sectionTitle: {
        color: Style.getColor('primary-text1'),
        paddingTop: 12,
        fontSize: 16,
        paddingBottom: 6,
        marginBottom: 8,
        borderBottomWidth: 1,
        borderColor: Style.getColor('primary-surface3'),
    },

    subtitle: {
        color: Style.getColor('primary-text2'),
        paddingBottom: 2,
        marginBottom: 8,
    },
})
