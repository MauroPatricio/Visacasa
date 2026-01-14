import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
    textStyle: {
        fontFamily: "bold",
        fontSize: 40
    },
    appBarWrapper: {
        paddingHorizontal: 15,
        paddingTop: 10,
        backgroundColor: 'white',
    },
    appBar: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 10,
    },
    location: {
        fontSize: 16,
        fontWeight: "700",
        color: '#1F2937',
        flex: 1,
        marginLeft: 12,
    },
    locationView: {
        flexDirection: "row",
        alignItems: "center",
    },
    cartCount: {
        position: "absolute",
        top: -5,
        right: -5,
        width: 18,
        height: 18,
        borderRadius: 9,
        alignItems: "center",
        backgroundColor: '#E85A4F',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: 'white',
        zIndex: 999,
    },
    cartNumber: {
        fontWeight: '700',
        fontSize: 9,
        color: 'white',
    },
    cover: {
        width: 45,
        height: 45,
        borderRadius: 22.5,
        backgroundColor: '#F3F4F6',
    }
})


export default styles