import React, { useEffect, useState } from "react"
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ImageBackground,
    ScrollView,
    StatusBar,
    Dimensions,
    Pressable,
    Image,
    TextInput,
    Alert,
    ActivityIndicator
} from "react-native"
import { useNavigation } from "@react-navigation/native"
import MaterialIcons from "react-native-vector-icons/MaterialIcons"
import SimpleLineIcons from "react-native-vector-icons/SimpleLineIcons"
import DropDownPicker from "react-native-dropdown-picker"
import { userAPI } from '../../api/apiService'

const { width, height } = Dimensions.get('window')

const wp = (percentage) => (width * percentage) / 100
const hp = (percentage) => (height * percentage) / 100

export default function EditProfileScreen() {
    const navigation = useNavigation()
    
    // Loading states
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    
    // Personal Details
    const [email, setEmail] = useState('')
    const [phoneNumber, setPhoneNumber] = useState('')
    
    // Business Address Details  
    const [pincode, setPincode] = useState('')
    const [address, setAddress] = useState('')
    const [city, setCity] = useState('')
    const [country, setCountry] = useState('India')
    
    // State dropdown
    const [openState, setOpenState] = useState(false)
    const [selectedState, setSelectedState] = useState('')
    const [states] = useState([
        { label: 'Madhya Pradesh', value: 'Madhya Pradesh' },
        { label: 'Maharashtra', value: 'Maharashtra' },
        { label: 'Rajasthan', value: 'Rajasthan' },
        { label: 'Gujarat', value: 'Gujarat' },
        { label: 'West Bengal', value: 'West Bengal' },
        { label: 'Karnataka', value: 'Karnataka' },
        { label: 'Tamil Nadu', value: 'Tamil Nadu' },
        { label: 'Delhi', value: 'Delhi' },
    ])
    
    // Card Information
    const [cardNumber, setCardNumber] = useState('')
    const [cardholderName, setCardholderName] = useState('')
    const [cvc, setCvc] = useState('')
    const [expiryMonth, setExpiryMonth] = useState('')
    const [expiryYear, setExpiryYear] = useState('')
    
    // Dropdowns for card expiry
    const [openMonth, setOpenMonth] = useState(false)
    const [openYear, setOpenYear] = useState(false)
    
    const [months] = useState([
        { label: "01", value: "01" },
        { label: "02", value: "02" },
        { label: "03", value: "03" },
        { label: "04", value: "04" },
        { label: "05", value: "05" },
        { label: "06", value: "06" },
        { label: "07", value: "07" },
        { label: "08", value: "08" },
        { label: "09", value: "09" },
        { label: "10", value: "10" },
        { label: "11", value: "11" },
        { label: "12", value: "12" },
    ])
    
    const [years, setYears] = useState([])

    useEffect(() => {
        const currentYear = new Date().getFullYear()
        const expirationYears = Array.from({ length: 20 }, (_, i) => {
            const yearValue = currentYear + i
            return { label: yearValue.toString(), value: yearValue.toString() }
        })
        setYears(expirationYears)
        
        fetchUserProfile()
    }, [])

    const fetchUserProfile = async () => {
        try {
            setLoading(true)
            const response = await userAPI.getProfile()
            
            console.log('Edit Profile - Fetched Data:', response)
            
            if (response) {
                const userData = response.user || response
                
                setEmail(userData.email || '')
                setPhoneNumber(userData.phone_number || '')
                setAddress(userData.address || '')
                
                if (userData.card_information) {
                    setCardNumber(userData.card_information.card_number || '')
                    setCardholderName(userData.card_information.cardholder_name || '')
                    setExpiryMonth(userData.card_information.expiry_month || '')
                    setExpiryYear(userData.card_information.expiry_year || '')
                    setCvc(userData.card_information.cvc || '')
                }
            }
        } catch (err) {
            console.error('Error fetching profile:', err)
            Alert.alert('Error', 'Failed to load profile.')
        } finally {
            setLoading(false)
        }
    }

    const handleSaveProfile = async () => {
        try {
            if (!email.trim()) {
                Alert.alert('Validation Error', 'Email is required')
                return
            }
            
            setSaving(true)
            
            // Build full address
            let fullAddress = address.trim()
            if (pincode || city || selectedState || country) {
                const parts = []
                if (address.trim()) parts.push(address.trim())
                if (city.trim()) parts.push(city.trim())
                if (selectedState) parts.push(selectedState)
                if (pincode.trim()) parts.push(pincode.trim())
                if (country.trim()) parts.push(country.trim())
                fullAddress = parts.join(', ')
            }
            
            // ONLY send editable fields - no read-only fields
            const updateData = {}
            
            updateData.email = email.trim()
            
            if (phoneNumber.trim()) {
                updateData.phone_number = phoneNumber.trim()
            }
            
            if (fullAddress) {
                updateData.address = fullAddress
            }
            
            // Only send card info if at least one field is filled
            if (cardNumber || cardholderName || expiryMonth || expiryYear || cvc) {
                updateData.card_information = {}
                if (cardNumber.trim()) updateData.card_information.card_number = cardNumber.trim()
                if (cardholderName.trim()) updateData.card_information.cardholder_name = cardholderName.trim()
                if (expiryMonth) updateData.card_information.expiry_month = expiryMonth
                if (expiryYear) updateData.card_information.expiry_year = expiryYear
                if (cvc.trim()) updateData.card_information.cvc = cvc.trim()
            }
            
            console.log('Sending to backend:', updateData)
            
            const response = await userAPI.updateProfile(updateData)
            
            console.log('Save response:', response)
            
            if (response) {
                Alert.alert(
                    'Success',
                    'Profile updated successfully!',
                    [{ text: 'OK', onPress: () => navigation.goBack() }]
                )
            }
        } catch (err) {
            console.error('Error saving profile:', err)
            Alert.alert('Error', err.message || 'Failed to save profile.')
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color="#130160" />
                <Text style={styles.loadingText}>Loading...</Text>
            </View>
        )
    }

    return (
        <ScrollView 
            style={styles.container} 
            showsVerticalScrollIndicator={false}
            nestedScrollEnabled={true}
        >
            <StatusBar translucent={true} backgroundColor={'transparent'} />
            <ImageBackground source={require('../../../assets/vector_1.png')} style={styles.vector}>
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.headerChild}>
                        <Pressable onPress={() => navigation.goBack()}>
                            <MaterialIcons name='arrow-back-ios' color={'#0D0D26'} size={23} />
                        </Pressable>
                        <Text style={styles.headerText}>Edit Profile</Text>
                    </View>
                </View>
                
                {/* Profile Picture */}
                <View style={styles.profileSection}>
                    <Image
                        source={require("../../../assets/profile_img.png")}
                        style={styles.profilePicture}
                    />
                    <TouchableOpacity style={styles.editBtn}>
                        <MaterialIcons name="edit" size={14} color="#fff" />
                    </TouchableOpacity>
                </View>
                
                {/* Personal Details */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Personal Details</Text>
                    
                    <Text style={styles.label}>Email</Text>
                    <View style={styles.inputWrapper}>
                        <TextInput
                            placeholder='Enter email'
                            value={email}
                            onChangeText={setEmail}
                            style={styles.textInput}
                            placeholderTextColor={'gray'}
                            keyboardType='email-address'
                            autoCapitalize='none'
                        />
                    </View>
                    
                    <Text style={styles.label}>Password</Text>
                    <View style={styles.inputWrapper}>
                        <TextInput
                            value='************'
                            style={styles.textInput}
                            editable={false}
                        />
                    </View>
                    <TouchableOpacity 
                        style={styles.changePasswordBtn} 
                        onPress={() => navigation.navigate('ChangePassword')}
                    >
                        <Text style={styles.changePasswordText}>Change Password</Text>
                    </TouchableOpacity>
                    
                    <Text style={styles.label}>Phone Number</Text>
                    <View style={styles.inputWrapper}>
                        <TextInput
                            placeholder='Enter phone'
                            value={phoneNumber}
                            onChangeText={setPhoneNumber}
                            style={styles.textInput}
                            placeholderTextColor={'gray'}
                            keyboardType='phone-pad'
                        />
                    </View>
                </View>
                
                <View style={styles.divider} />
                
                {/* Business Address */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Business Address Details</Text>
                    
                    <Text style={styles.label}>Pincode</Text>
                    <View style={styles.inputWrapper}>
                        <TextInput
                            placeholder='Enter pincode'
                            value={pincode}
                            onChangeText={setPincode}
                            style={styles.textInput}
                            placeholderTextColor={'gray'}
                            keyboardType='numeric'
                        />
                    </View>
                    
                    <Text style={styles.label}>Address</Text>
                    <View style={styles.inputWrapper}>
                        <TextInput
                            placeholder='Enter address'
                            value={address}
                            onChangeText={setAddress}
                            style={styles.textInput}
                            placeholderTextColor={'gray'}
                        />
                    </View>
                    
                    <Text style={styles.label}>City</Text>
                    <View style={styles.inputWrapper}>
                        <TextInput
                            placeholder='Enter city'
                            value={city}
                            onChangeText={setCity}
                            style={styles.textInput}
                            placeholderTextColor={'gray'}
                        />
                    </View>
                    
                    <Text style={styles.label}>State</Text>
                    <View style={styles.dropdownContainer}>
                        <DropDownPicker
                            open={openState}
                            value={selectedState}
                            items={states}
                            setOpen={setOpenState}
                            setValue={setSelectedState}
                            placeholder="Select state"
                            style={styles.dropdown}
                            textStyle={styles.dropdownText}
                            dropDownContainerStyle={styles.dropdownContainerStyle}
                            ArrowDownIconComponent={() => <SimpleLineIcons name="arrow-down" size={20} color="#000" />}
                        />
                    </View>
                    
                    <Text style={styles.label}>Country</Text>
                    <View style={styles.inputWrapper}>
                        <TextInput
                            placeholder='Enter country'
                            value={country}
                            onChangeText={setCountry}
                            style={styles.textInput}
                            placeholderTextColor={'gray'}
                        />
                    </View>
                </View>
                
                <View style={styles.divider} />
                
                {/* Card Information */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Card Information</Text>
                    
                    <Text style={styles.label}>Card Number</Text>
                    <View style={styles.inputWrapper}>
                        <TextInput
                            placeholder='Enter card number'
                            value={cardNumber}
                            onChangeText={setCardNumber}
                            style={styles.textInput}
                            placeholderTextColor={'gray'}
                            keyboardType='numeric'
                            maxLength={16}
                        />
                    </View>
                    
                    <Text style={styles.label}>Cardholder Name</Text>
                    <View style={styles.inputWrapper}>
                        <TextInput
                            placeholder='Enter name'
                            value={cardholderName}
                            onChangeText={setCardholderName}
                            style={styles.textInput}
                            placeholderTextColor={'gray'}
                        />
                    </View>
                    
                    <View style={styles.expiryRow}>
                        <View style={styles.monthDropContainer}>
                            <DropDownPicker
                                open={openMonth}
                                value={expiryMonth}
                                items={months}
                                setOpen={setOpenMonth}
                                setValue={setExpiryMonth}
                                placeholder="MM"
                                style={styles.dropdown}
                                textStyle={styles.dropdownText}
                                dropDownContainerStyle={styles.dropdownContainerStyle}
                                ArrowDownIconComponent={() => <SimpleLineIcons name="arrow-down" size={20} color="#000" />}
                            />
                        </View>
                        <View style={styles.monthDropContainer}>
                            <DropDownPicker
                                open={openYear}
                                value={expiryYear}
                                items={years}
                                setOpen={setOpenYear}
                                setValue={setExpiryYear}
                                placeholder="YYYY"
                                style={styles.dropdown}
                                textStyle={styles.dropdownText}
                                dropDownContainerStyle={styles.dropdownContainerStyle}
                                ArrowDownIconComponent={() => <SimpleLineIcons name="arrow-down" size={20} color="#000" />}
                            />
                        </View>
                    </View>
                    
                    <View style={styles.inputContainer}>
                        <TextInput
                            placeholder="CVC"
                            keyboardType="numeric"
                            maxLength={4}
                            value={cvc}
                            onChangeText={setCvc}
                            style={styles.input}
                            placeholderTextColor="gray"
                        />
                    </View>
                </View>
                
                {/* Save Button */}
                <TouchableOpacity 
                    style={[styles.saveButton, saving && styles.saveButtonDisabled]} 
                    onPress={handleSaveProfile}
                    disabled={saving}
                >
                    {saving ? (
                        <ActivityIndicator size="small" color="#fff" />
                    ) : (
                        <Text style={styles.saveButtonText}>Save Profile</Text>
                    )}
                </TouchableOpacity>
            </ImageBackground>
            <View style={{ height: hp(7) }} />
            <ImageBackground source={require('../../../assets/vector_2.png')} style={styles.vector2} />
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff'
    },
    loadingText: {
        marginTop: 10,
        fontFamily: 'Nunito-Regular',
        color: '#000'
    },
    vector: {
        flex: 1,
        width: wp(100),
    },
    vector2: {
        flex: 1,
        width: wp(100),
        height: height * 2,
        position: 'absolute',
        bottom: 0,
        zIndex: -1
    },
    header: {
        width: wp(100),
        height: hp(7),
        marginTop: '10%',
        paddingHorizontal: '5%',
    },
    headerChild: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerText: {
        fontFamily: 'Nunito-Bold',
        fontSize: hp(3.2),
        color: '#0D0140',
        marginLeft: 10
    },
    profileSection: {
        alignItems: "center",
        marginTop: 20,
        marginBottom: 20
    },
    profilePicture: {
        width: wp(26),
        height: wp(26),
        borderRadius: 40,
    },
    editBtn: {
        width: wp(7.5),
        height: wp(7.5),
        backgroundColor: '#130160',
        position: 'absolute',
        bottom: 0,
        right: '36.5%',
        borderRadius: 20,
        borderWidth: 3,
        borderColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center'
    },
    section: {
        padding: 20
    },
    sectionTitle: {
        fontFamily: 'Nunito-SemiBold',
        fontSize: wp(5),
        color: '#000',
        marginBottom: 15
    },
    label: {
        fontFamily: 'Nunito-SemiBold',
        fontSize: hp(1.8),
        color: '#000',
        marginTop: 10,
        marginBottom: 5
    },
    inputWrapper: {
        backgroundColor: '#fff',
        width: '100%',
        height: hp(6.5),
        borderRadius: 8,
        marginBottom: 10,
        paddingHorizontal: 20,
        justifyContent: 'center',
        borderWidth: 0.4,
        borderColor: '#524B6B'
    },
    textInput: {
        fontFamily: 'Nunito-Regular',
        fontSize: hp(2.2),
        color: '#000'
    },
    changePasswordBtn: {
        marginBottom: 15,
        alignItems: 'flex-end'
    },
    changePasswordText: {
        color: '#14BA9C',
        fontFamily: 'DMSans-Regular',
        textDecorationLine: 'underline'
    },
    divider: {
        borderWidth: 0.3,
        borderColor: '#C4C4C4',
        width: wp(90),
        alignSelf: 'center',
        marginVertical: 20
    },
    dropdownContainer: {
        backgroundColor: '#fff',
        width: '100%',
        borderRadius: 8,
        marginBottom: 10,
        borderWidth: 0.4,
        borderColor: '#524B6B',
        zIndex: 5
    },
    dropdown: {
        backgroundColor: '#fff',
        borderColor: '#524B6B',
        height: hp(6),
        borderRadius: 6,
        borderWidth: 0
    },
    dropdownText: {
        fontFamily: 'Nunito-Regular',
        fontSize: 16,
        color: '#000',
    },
    dropdownContainerStyle: {
        borderColor: '#524B6B',
        backgroundColor: '#fff',
    },
    expiryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    monthDropContainer: {
        width: '48%',
        borderRadius: 8,
        borderWidth: 0.4,
        borderColor: '#524B6B',
        zIndex: 5
    },
    inputContainer: {
        backgroundColor: '#fff',
        width: '45%',
        height: hp(6.5),
        borderRadius: 8,
        paddingHorizontal: 15,
        justifyContent: 'center',
        borderWidth: 0.4,
        borderColor: '#524B6B',
    },
    input: {
        fontFamily: 'Nunito-Regular',
        fontSize: hp(2),
        color: '#000'
    },
    saveButton: {
        backgroundColor: '#130160',
        width: '90%',
        height: hp(7),
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center',
        marginTop: 20
    },
    saveButtonDisabled: {
        opacity: 0.7
    },
    saveButtonText: {
        fontFamily: 'Nunito-SemiBold',
        color: '#fff',
        fontSize: hp(2.5)
    }
})