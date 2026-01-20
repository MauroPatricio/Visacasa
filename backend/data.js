import bcrypt from 'bcryptjs';

const data = {
  users: [
    {
      // _id:'1',
      name: 'Mauro Patricio',
      email: 'mauro.patricio@gmail.com',
      password: bcrypt.hashSync('Patrick2019#'),
      phoneNumber: 840575992,
      isAdmin: true,
      isDeliveryMan: true,

    },
    {
      name: 'Vendedor Teste',
      email: 'vendedor@test.com',
      password: bcrypt.hashSync('test1234'),
      phoneNumber: 840000001,
      isAdmin: false,
      isSeller: true,
      isApproved: true,
      seller: {
        name: 'Loja de Teste',
        description: 'Descrição da loja de teste',
        logo: '/images/visacasalogo.png',
        rating: 5,
        numReviews: 10,
      }
    },
  ],
  categories: [
    { _id: '65a0f0000000000000000001', name: 'Aluminium', nome: 'Aluminio', description: 'Materiais de alumínio', isActive: true, icon: 'FaLayerGroup' },
    { _id: '65a0f0000000000000000002', name: 'Masonry', nome: 'Alvenaria', description: 'Materiais de alvenaria', isActive: true, icon: 'GiBrickWall' },
    { _id: '65a0f0000000000000000003', name: 'Concrete', nome: 'Betões', description: 'Betão e derivados', isActive: true, icon: 'MdOutlineConstruction' },
    { _id: '65a0f0000000000000000004', name: 'Cement', nome: 'Cimento', description: 'Cimento de todas as classes', isActive: true, icon: 'FaHardHat' },
    { _id: '65a0f0000000000000000005', name: 'Roofing', nome: 'Coberturas', description: 'Materiais para cobertura', isActive: true, icon: 'FaHome' },
    { _id: '65a0f0000000000000000006', name: 'Electricity', nome: 'Electricidade, sistemas de control', description: 'Material elétrico e controlo', isActive: true, icon: 'FaBolt' },
    { name: 'Locks and Hardware', nome: 'Fechaduras e ferragens', description: 'Fechaduras e ferragens diversas', isActive: true, icon: 'FaTools' },
    { name: 'Iron', nome: 'Ferro', description: 'Ferro e aço para construção', isActive: true, icon: 'FaLayerGroup' },
    { name: 'Lighting', nome: 'Iluminação', description: 'Artigos de iluminação', isActive: true, icon: 'FaLightbulb' },
    { name: 'Aggregates', nome: 'Inertes', description: 'Areia, pedra e outros inertes', isActive: true, icon: 'GiStoneStack' },
    { name: 'Sanitary Ware', nome: 'Louças Sanitárias', description: 'Louças e equipamentos sanitários', isActive: true, icon: 'FaToilet' },
    { name: 'Prefabricated', nome: 'Pre-Fabricados', description: 'Elementos pré-fabricados', isActive: true, icon: 'FaCube' },
    { name: 'Sewage Network', nome: 'Rede de esgotos e acessorios', description: 'Tubagens e acessórios de esgoto', isActive: true, icon: 'FaShower' },
    { name: 'Water Network', nome: 'Rede de água', description: 'Tubagens e acessórios de água', isActive: true, icon: 'FaTint' },
    { name: 'Coatings', nome: 'Revistimentos', description: 'Pisos e revestimentos', isActive: true, icon: 'FaBoxOpen' },
    { name: 'Faucets', nome: 'Torneiras', description: 'Torneiras e misturadoras', isActive: true, icon: 'MdWaterDrop' },
    { name: 'Fences', nome: 'Vedações', description: 'Materiais para vedação', isActive: true, icon: 'FaShieldAlt' },
    { name: 'Waterproofing', nome: 'impermeabilizações', description: 'Impermeabilizantes e isolamentos', isActive: true, icon: 'FaShieldAlt' },
  ],


  products: [
    {
      name: 'Cimento Nacional 42.5',
      nome: 'Cimento Nacional 42.5',
      slug: 'cimento-nacional-42-5',
      category: '65a0f0000000000000000004',
      image: '/default_img.jpg',
      price: 550,
      priceFromSeller: 385,
      comissionPercentage: 0.3,
      priceComission: 165,
      countInStock: 100,
      brand: 'Nacional',
      rating: 4.5,
      numReviews: 10,
      description: 'Cimento de alta resistência 42.5',
      isActive: true,
    },
    {
      name: 'Tijolo Burro',
      nome: 'Tijolo Burro',
      slug: 'tijolo-burro',
      category: '65a0f0000000000000000002',
      image: '/default_img.jpg',
      price: 15,
      priceFromSeller: 10.5,
      comissionPercentage: 0.3,
      priceComission: 4.5,
      countInStock: 2000,
      brand: 'Local',
      rating: 4.0,
      numReviews: 5,
      description: 'Tijolo burro para construção',
      isActive: true,
    },
  ],
};

export default data;
