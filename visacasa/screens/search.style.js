import { StyleSheet, Dimensions } from "react-native";
const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
    header: {
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 20,
        backgroundColor: 'white',
    },
    searchContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#F3F4F6",
        borderRadius: 15,
        paddingHorizontal: 15,
        height: 55,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    searchWrapper: {
        flex: 1,
        marginLeft: 10,
    },
    searchInput: {
        fontSize: 16,
        color: '#1F2937',
        height: '100%',
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
        backgroundColor: 'white',
    },
    emptyStateContainer: {
        alignItems: 'center',
        marginTop: -50, // Slight offset for better visual balance
    },
    iconCircle: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#FFF1F0',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    emptyTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: '#1F2937',
        marginBottom: 10,
    },
    emptySubtitle: {
        fontSize: 14,
        color: '#6B7280',
        textAlign: 'center',
        lineHeight: 20,
    },
    noDataText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#374151',
        marginTop: 20,
        marginBottom: 5,
    },
    listStyle: {
        flex: 1,
        paddingHorizontal: 15,
    }
});

export default styles;