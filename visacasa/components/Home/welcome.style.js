import { StyleSheet } from "react-native";
import { COLORS, SIZES } from "../../constants";

const styles = StyleSheet.create({
    container: {
        width: "100%",
    },
    welcomeText: (color, size, top) => ({
        fontWeight: 'bold',
        fontSize: size,
        marginTop: top,
        marginHorizontal: 25,
        color: color,

    }),
    welcomeText2: (color, size, top) => ({
        fontSize: size,
        marginTop: top,
        marginHorizontal: 25,
        color: color,
        fontWeight: "700"
    }),
    searchContainer: {
        flexDirection: "row",
        justifyContent: "center",
        backgroundColor: "#F3F4F6", // Light modern gray
        borderRadius: 15,
        marginVertical: 15,
        marginHorizontal: 15,
        height: 50,
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    searchIcon: {
        marginHorizontal: 15,
        color: "#E85A4F", // Matches principal color
    },
    searchWrapper: {
        flex: 1,
        height: '100%',
        justifyContent: 'center',
    },
    searchInput: {
        fontSize: 14,
        fontWeight: "400",
        color: '#333',
    },
    searchBtn: {
        width: 45,
        height: 45,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: "center",
        backgroundColor: '#E85A4F',
        marginRight: 4,
    }

})

export default styles;