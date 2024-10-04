import AnimatedView from '@components/AnimatedView'
import { FontAwesome } from '@expo/vector-icons'
import { Characters, Chats, Logger, Style } from '@globals'
import { CharacterCardV2 } from 'app/constants/Characters'
import { Tokenizer } from 'app/constants/Tokenizer'
import * as DocumentPicker from 'expo-document-picker'
import { Stack, useRouter } from 'expo-router'
import { useEffect, useState } from 'react'
import { useAutosave } from 'react-autosave'
import {
    View,
    Text,
    SafeAreaView,
    StyleSheet,
    Image,
    TouchableOpacity,
    Alert,
    ScrollView,
    TextInput,
    BackHandler,
} from 'react-native'
import { useShallow } from 'zustand/react/shallow'

import React from 'react'
import { Trans } from 'react-i18next'

const CharInfo = () => {
    const router = useRouter()
    const { currentCard, setCurrentCard, charId, charName, unloadCharacter } =
        Characters.useCharacterCard(
            useShallow((state) => ({
                charId: state.id,
                currentCard: state.card,
                setCurrentCard: state.setCard,
                charName: state.card?.data.name,
                unloadCharacter: state.unloadCard,
            }))
        )
    const getTokenCount = Tokenizer.useTokenizer((state) => state.getTokenCount)
    const [characterCard, setCharacterCard] = useState<CharacterCardV2 | undefined>(currentCard)

    const imageDir = Characters.getImageDir(currentCard?.data.image_id ?? -1)
    const { chat, unloadChat } = Chats.useChat((state) => ({
        chat: state.data,
        unloadChat: state.reset,
    }))

    const [imageSource, setImageSource] = useState({
        uri: imageDir,
    })

    useEffect(() => {
        const backAction = () => {
            if (!chat) unloadCharacter()
            return false
        }
        const handler = BackHandler.addEventListener('hardwareBackPress', backAction)
        return () => handler.remove()
    }, [])

    const handleImageError = () => {
        setImageSource(require('@assets/user.png'))
    }

    const autosave = () => {
        if (!characterCard || charName === 'Welcome') return
        Logger.log(`Autosaved Card ${charName}`)
        savecard()
    }

    const savecard = async () => {
        if (characterCard && charId)
            return Characters.db.mutate.updateCard(characterCard, charId).then(() => {
                setCurrentCard(charId)
            })
    }

    useAutosave({
        data: characterCard,
        onSave: autosave,
        interval: 3000,
    })

    const deleteCard = () => {
        Alert.alert(
            `Delete Character`,
            `Are you sure you want to delete this character? This cannot be undone.`,
            [
                { text: 'Cancel', onPress: () => {}, style: 'cancel' },
                {
                    text: 'Confirm',
                    onPress: () => {
                        Characters.db.mutate.deleteCard(charId ?? -1)
                        unloadCharacter()
                        unloadChat()
                        router.back()
                    },
                    style: 'destructive',
                },
            ],
            { cancelable: true }
        )
    }

    const handleImportImage = () => {
        DocumentPicker.getDocumentAsync({
            copyToCacheDirectory: true,
            type: 'image/*',
        }).then((result: DocumentPicker.DocumentPickerResult) => {
            if (result.canceled || !charId) return
            Characters.useCharacterCard.getState().updateImage(result.assets[0].uri)
        })
    }

    return (
        <AnimatedView dy={200} tduration={500} fade={0} fduration={500} style={{ flex: 1 }}>
            <SafeAreaView style={styles.mainContainer}>
                <Stack.Screen
                    options={{
                        headerRight: () => (
                            <View style={styles.buttonContainer}>
                                <TouchableOpacity
                                    style={styles.button}
                                    onPress={() => {
                                        savecard()
                                        Logger.log(`Character saved!`, true)
                                    }}>
                                    <FontAwesome
                                        name="save"
                                        size={28}
                                        color={Style.getColor('primary-text1')}
                                    />
                                </TouchableOpacity>

                                <TouchableOpacity style={styles.button} onPress={deleteCard}>
                                    <FontAwesome
                                        name="trash"
                                        size={28}
                                        color={Style.getColor('primary-text1')}
                                    />
                                </TouchableOpacity>
                            </View>
                        ),
                    }}
                />
                {characterCard && (
                    <ScrollView keyboardShouldPersistTaps="handled">
                        <View style={styles.characterHeader}>
                            <Image
                                source={imageSource}
                                style={styles.avatar}
                                onError={handleImageError}
                            />

                            <View style={styles.characterHeaderInfo}>
                                <Text
                                    style={{
                                        fontSize: 20,
                                        color: Style.getColor('primary-text1'),
                                    }}>
                                    {charName}
                                </Text>
                                <View style={styles.buttonContainer}>
                                    <TouchableOpacity
                                        style={styles.foregroundButton}
                                        onPress={handleImportImage}>
                                        <FontAwesome
                                            name="upload"
                                            size={20}
                                            color={Style.getColor('primary-text1')}
                                        />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>

                        <Text style={styles.boxText}>
                            <Trans>Description Tokens:</Trans>{' '}
                            {getTokenCount(characterCard?.data?.description ?? '')}
                        </Text>

                        <ScrollView
                            keyboardShouldPersistTaps="handled"
                            style={styles.inputContainer}>
                            <TextInput
                                style={styles.input}
                                multiline
                                onChangeText={(mes) => {
                                    setCharacterCard({
                                        ...characterCard,
                                        data: { ...characterCard.data, description: mes },
                                    })
                                }}
                                value={characterCard?.data?.description}
                                numberOfLines={8}
                            />
                        </ScrollView>

                        <Text style={styles.boxText}><Trans>First Message</Trans></Text>
                        <ScrollView
                            keyboardShouldPersistTaps="handled"
                            style={styles.inputContainer}>
                            <TextInput
                                style={styles.input}
                                multiline
                                onChangeText={(mes) => {
                                    setCharacterCard({
                                        ...characterCard,
                                        data: { ...characterCard.data, first_mes: mes },
                                    })
                                }}
                                value={characterCard?.data?.first_mes}
                                numberOfLines={8}
                            />
                        </ScrollView>
                    </ScrollView>
                )}
            </SafeAreaView>
        </AnimatedView>
    )
}

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        paddingHorizontal: 16,
        paddingVertical: 16,
    },

    button: {
        marginRight: 20,
    },

    characterHeader: {
        alignContent: 'flex-start',
        padding: 16,
        borderRadius: 16,
        flexDirection: 'row',
        alignItems: 'center',
    },

    characterHeaderInfo: {
        marginLeft: 12,
    },

    buttonContainer: {
        justifyContent: 'flex-start',
        flexDirection: 'row',
        marginTop: 4,
    },

    foregroundButton: {
        backgroundColor: Style.getColor('primary-surface1'),
        padding: 8,
        borderRadius: 4,
    },

    avatar: {
        width: 80,
        height: 80,
        borderRadius: 20,
        borderColor: Style.getColor('primary-brand'),
        borderWidth: 2,
    },

    inputContainer: {
        backgroundColor: Style.getColor('primary-surface1'),
        borderColor: Style.getColor('primary-brand'),
        borderRadius: 8,
        borderWidth: 1,
        paddingHorizontal: 8,
        maxHeight: 160,
    },

    boxText: {
        color: Style.getColor('primary-text2'),
        paddingTop: 16,
        paddingBottom: 8,
    },

    input: {
        color: Style.getColor('primary-text1'),
        textAlignVertical: 'top',
        paddingVertical: 8,
    },
})

export default CharInfo
