import React from 'react';
import { View, Text, Image, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

const ProductSellerDetail = () => {
    const {
        params: { product }
    } = useRoute();

    const navigation = useNavigation();

    if (!product) {
        return <View style={styles.loader}><Text>Processando...</Text></View>;
    }

    return (
        <ScrollView style={styles.container}>
            {/* Top Section with Image and Back Button */}
            <View style={styles.top}>
                <Image 
                    source={{ uri: product.image }} 
                    style={styles.image} 
                    resizeMode="cover" 
                />
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name='chevron-back-circle' size={40} color="#ffffff" />
                </TouchableOpacity>
            </View>

            {/* Card with Product Details */}
            <View style={styles.card}>
                <Text style={styles.name}>{product?.nome}</Text>

<Text style={styles.category}>
    Categoria do Produto: {product?.category?.nome || 'Não categorizado'}
</Text>

<<<<<<< HEAD
<Text style={styles.province}>
    Localização: {product?.province?.name || 'Não especificada'}
</Text>
=======
              {product.onSale && (
                  <Text style={styles.onSale}>Em promoção: {product.onSalePercentage}% </Text>
              )}
              <Text style={styles.brand}>Marca/sabor: {product.brand}</Text>
              <Text style={styles.description}>{product.description}</Text>
              <Text
                  style={[
                      styles.stock,
                      { color: product.countInStock > 0 ? '#7F00FF' : 'red' }
                  ]}
              >
                  {product.countInStock > 0 ? `Quantidade disponível: ${product.countInStock} unidade(s)` : 'Fora de estoque'}
              </Text>
              <Text style={styles.category}>
                  Categoria: {product.category?.nome || 'Sem categoria'}
              </Text>
              <Text style={styles.province}>
              Localização do produto: {product.province?.name || 'Sem provincia'}
              </Text>
              {/* <Text style={styles.qualityType}>
                  Quality: {product.qualityType?.name || 'Unknown Quality'}
              </Text>
              <Text style={styles.conditionStatus}>
                  Condition: {product.conditionStatus?.name || 'Unknown Condition'}
              </Text> */}
              {/* <Text style={styles.rating}>
                  Pontuação: {product.rating ? product.rating : 'Sem pontuacao'}
              </Text> */}
              </View>
              <View style={{ marginBottom: 210 }} />
>>>>>>> main

<Text style={styles.brand}>
    Marca ou Sabor: {product?.brand || 'Não especificado'}
</Text>

<Text style={[
    styles.stock, 
    { color: product?.countInStock > 0 ? '#1B5E20' : 'red' }
]}>
    {product?.countInStock > 0 ? 
      `Quantidade em Estoque: ${product?.countInStock} unidade(s)` : 
      'Produto Esgotado'}
</Text>

<Text style={styles.price}>
    Preço do Fornecedor: {product?.priceFromSeller} Mt
</Text>

<Text style={styles.price}>
    Preço de Venda ao Consumidor: {product?.price} Mt
</Text>

{product?.onSale && (
    <>
        <Text style={styles.onSale}>
            Desconto Aplicado: {product?.onSalePercentage}%
        </Text>

        <Text style={styles.onSale}>
            Preço Promocional: {product?.discount} Mt
        </Text>

        <Text style={styles.onSale}>
            Valor a receber pelo Vendedor: {product?.sellerEarningsAfterDiscount} Mt
        </Text>
    </>
)}

<Text style={styles.description}>
    Descrição: {product?.description}
</Text>

{product?.isGuaranteed && (
    <Text style={styles.guarantee}>
        Garantia: {product?.guaranteedPeriod} meses
    </Text>
)}

{product?.isOrdered && (
    <Text style={styles.delivery}>
        Prazo de Entrega: {product?.orderPeriod} dias
    </Text>
)}

            </View>

            {/* Spacer at bottom */}
            <View style={{ marginBottom: 100 }}/>
        </ScrollView>
    )
};

export default ProductSellerDetail;
<<<<<<< HEAD

const styles = StyleSheet.create({  
    container: {
        flex: 1,
        backgroundColor: '#F4F4F4',
    },
    top: {
        position: 'relative',
    },
    image: {
        width: '100%',
        height: 350,
    },
    backBtn: {
        position: 'absolute',
        top: 40,
        left: 20,
    },
    card: {
        backgroundColor: '#FFFFFF',
        marginTop: -30,
        marginHorizontal: 20,
        padding: 25,
        borderRadius: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 5,
    },
    name: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#222',
        textAlign: 'center',
        marginBottom: 20,
    },
    category: {
        fontSize: 17,
        color: '#666',
        marginBottom: 12,
        textAlign: 'center',
    },
    province: {
        fontSize: 17,
        color: '#666',
        marginBottom: 12,
        textAlign: 'center',
    },
    brand: {
        fontSize: 17,
        color: '#666',
        marginBottom: 12,
        textAlign: 'center',
    },
    stock: {
        fontSize: 17,
        fontWeight: '600',
        textAlign: 'center',
        marginBottom: 12,
    },
    price: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#6A0DAD',
        marginBottom: 12,
        textAlign: 'center',
    },
    onSale: {
        fontSize: 15,
        color: 'blue',
        fontWeight: 'bold',
        marginBottom: 12,
        textAlign: 'center',
    },
    description: {
        fontSize: 17,
        color: '#444',
        textAlign: 'center',
        marginBottom: 20,
        lineHeight: 24,
    },
    guarantee: {
        fontSize: 17,
        color: '#1B5E20',
        fontWeight: '600',
        marginBottom: 12,
        textAlign: 'center',
    },
    delivery: {
        fontSize: 17,
        color: '#007BFF',
        fontWeight: '600',
        marginBottom: 12,
        textAlign: 'center',
    },
    loader: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    }
=======
const styles = StyleSheet.create({
  back: {
    top:40,
    color: '#7F00FF',
  },
  icons: {
    position: 'absolute',
    // top: 40,
    // left: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '90%',
  },
  container: {
      flex: 1,
      backgroundColor: '#7F00FF', // Light background for contrast
      padding: 16,                // Padding around the content
  },
  button: {
      backgroundColor: '#007BFF',        // Blue background for the back button
      paddingVertical: 12,               // Vertical padding for button height
      paddingHorizontal: 20,             // Horizontal padding for button width
      borderRadius: 30,                  // Fully rounded corners
      alignItems: 'center',              // Center button text
      justifyContent: 'center',          // Vertically align text
      alignSelf: 'flex-start',           // Align button to the left
      marginBottom: 20,                  // Space between button and content
      shadowColor: '#000',               // Shadow for depth
      shadowOffset: { width: 0, height: 3 }, // Shadow spread
      shadowOpacity: 0.2,                // Subtle shadow
      shadowRadius: 5,                   // Shadow size
      elevation: 4,                      // Elevation for Android shadow
  },
  buttonText: {
      fontSize: 16,                      // Font size for the button text
      color: '#fff',                     // White text color
      fontWeight: '600',                 // Semi-bold for emphasis
  },
  image: {
      width: '100%',
      height: 300,
      borderRadius: 10,                  // Rounded image corners
      // marginBottom: 20,                  // Space below the image
      backgroundColor: 'white',        // Placeholder color before image loads
  },
  details: {
      backgroundColor: '#fff',           // White background for card effect
      borderRadius: 20,                  // Rounded corners for card
      padding: 20,                       // Padding inside the card
      shadowColor: '#000',               // Shadow for depth
      shadowOffset: { width: 0, height: 2 }, // Subtle shadow
      shadowOpacity: 0.1,                // Light shadow
      shadowRadius: 5,                   // Soft shadow edges
      elevation: 3,                      // Elevation for Android
      marginBottom: 20,                  // Space below the details card
  },
  name: {
      fontSize: 24,                      // Product name font size
      fontWeight: '700',                 // Bold for emphasis
      color: '#333',                     // Dark grey for readability
      textAlign: 'center',               // Center the name
      marginBottom: 10,                  // Spacing below the name
  },
  price: {
      fontSize: 18,                      // Font size for price
      color: '#7F00FF',                  // Green for pricing
      fontWeight: '600',                 // Semi-bold for emphasis
      marginBottom: 10,                  // Spacing below the price
      textAlign: 'center',               // Centered text
  },
  onSale: {
      fontSize: 16,                      // Smaller font for sale info
      color: '#7F00FF',                  // Red color for promotions
      fontWeight: '500',                 // Medium font weight for emphasis
      marginBottom: 10,                  // Spacing below sale info
      textAlign: 'center',               // Center the text
  },
  brand: {
      fontSize: 16,                      // Standard font size for brand
      color: '#888',                     // Light grey color for less emphasis
      marginBottom: 10,                  // Spacing below brand info
      textAlign: 'center',               // Center the text
  },
  description: {
      fontSize: 16,                      // Font size for the description
      color: '#555',                     // Medium grey for better readability
      textAlign: 'justify',              // Justify the text for a neat look
      marginBottom: 20,                  // Space below description
  },
  stock: {
      fontSize: 16,                      // Standard font size for stock status
      fontWeight: '600',                 // Semi-bold for emphasis
      textAlign: 'center',               // Center the text
      marginBottom: 10,  
                      // Spacing below stock info
  },
  category: {
      fontSize: 16,                      // Standard font size for category
      color: '#888',                     // Light grey for less emphasis
      textAlign: 'center',               // Center the text
      marginBottom: 10,                  // Spacing below category info
  },
  province: {
      fontSize: 16,                      // Standard font size for province
      color: '#888',                     // Light grey for consistency
      textAlign: 'center',               // Center the text
      marginBottom: 10,                  // Spacing below province info
  },
>>>>>>> main
});
