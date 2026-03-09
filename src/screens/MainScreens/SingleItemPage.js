import {useNavigation, useRoute} from '@react-navigation/native';
import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  ImageBackground,
  StatusBar,
  Pressable,
  Image,
  ActivityIndicator,
  Alert,
  Share,
} from 'react-native';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Share_Icon from '../../../assets/share_icon.svg';

import {productsAPI} from '../../api/apiService';

const PLACEHOLDER = require('../../../assets/gray_img.png');

// ─────────────────────────────────────────────────────────────────────────────
// normalizeProduct
//
// Handles two possible input shapes:
//
//   A) "local" shape  — items that were normalised by BinStorePage's
//      normaliseProduct() before being passed as initialData. These have
//      `image` as a { uri } object and `price` already formatted as a string
//      like "$12" or a number.
//
//   B) "raw API" shape — objects returned directly from productsAPI.getById().
//      These have `image_inner` / `image_outer` strings and numeric prices.
//
// The function returns a unified shape that the rest of the screen uses.
// ─────────────────────────────────────────────────────────────────────────────
const normalizeProduct = raw => {
  if (!raw) return null;

  // Helper: parse a price value that might be a number, a plain string like
  // "12", or a formatted string like "$12.00".
  const parsePrice = val => {
    if (val == null) return null;
    const n = parseFloat(String(val).replace(/[^0-9.]/g, ''));
    return isNaN(n) ? null : n;
  };

  // Detect the "local / BinStorePage-normalised" shape by checking for the
  // fields that normaliseProduct() always produces: `discountPrice` or `image`
  // being an object (not a plain string).
  const isLocalShape =
    raw.discountPrice !== undefined ||
    (raw.image !== undefined && typeof raw.image !== 'string');

  if (isLocalShape) {
    let originalPrice = null;
    let offerPrice = null;

    if (raw.discountPrice && raw.originalPrice) {
      // BinStorePage card shape: discountPrice = offer, originalPrice = original
      offerPrice = parsePrice(raw.discountPrice);
      originalPrice = parsePrice(raw.originalPrice);
    } else {
      originalPrice = parsePrice(raw.price);
    }

    // image can be: { uri: string } | string | require(...) number
    const imageUri =
      typeof raw.image === 'object' && raw.image?.uri
        ? raw.image.uri
        : typeof raw.image === 'string'
        ? raw.image
        : raw.product_image || null;

    return {
      _id: raw._id || raw.id,
      title: raw.title || 'Untitled Product',
      description: raw.description || '',
      image_inner: imageUri,
      image_outer: imageUri,
      _originalImage: raw.image, // keep original for fallback
      price: originalPrice,
      offer_price: offerPrice,
      upc_id: raw.upc_id || null,
      type: raw.type || null,
      category_id: raw.category_id || null,
      status: raw.status || null,
      tags: raw.tags || [],
      createdAt: raw.createdAt || null,
    };
  }

  // Raw API shape — just spread and normalise image fields
  return {
    ...raw,
    image_inner:
      raw.image_inner ||
      raw.imageInner ||
      raw.inner_image ||
      raw.product_image ||
      (typeof raw.image === 'string' ? raw.image : raw.image?.uri) ||
      null,
    image_outer:
      raw.image_outer ||
      raw.imageOuter ||
      raw.outer_image ||
      raw.product_image ||
      (typeof raw.image === 'string' ? raw.image : raw.image?.uri) ||
      null,
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// getImageSource
// Converts any image value into a valid RN <Image> source prop.
// Handles: string URL, { uri } object, require() number, null/undefined.
// ─────────────────────────────────────────────────────────────────────────────
const getImageSource = value => {
  if (!value) return PLACEHOLDER;
  if (typeof value === 'string' && value.length > 0) return {uri: value};
  if (typeof value === 'object' && value.uri) return {uri: value.uri};
  if (typeof value === 'number') return value; // require() result
  return PLACEHOLDER;
};

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
const SingleItemPage = () => {
  const navigation = useNavigation();
  const route = useRoute();

  // Route params:
  //   productId   — ID to fetch fresh data from the API
  //   initialData — pre-normalised object from BinStorePage (instant display)
  //   section     — passed through for similar-item navigation context
  //   data        — the full list from BinStorePage, used to build similarItems
  //                 locally (same approach as the reference code)
  const {productId, initialData, section, data} = route.params || {};

  const [product, setProduct] = useState(
    initialData ? normalizeProduct(initialData) : null,
  );
  const [similarItems, setSimilarItems] = useState([]);
  const [isLoading, setIsLoading] = useState(!initialData);
  const [activeImage, setActiveImage] = useState('inner');
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    const id = productId || initialData?._id || initialData?.id;

    if (!id) {
      Alert.alert('Error', 'No product ID provided');
      navigation.goBack();
      return;
    }

    // ── Similar items — built locally from the data list passed by
    // BinStorePage, exactly like the reference code does it.
    // Falls back to empty if data wasn't passed (e.g. cold navigation).
    if (data && data.length > 0) {
      const filtered = data
        .filter(item => (item._id || item.id) !== id)
        .sort(() => 0.5 - Math.random())
        .slice(0, 4);
      setSimilarItems(filtered);
    }

    // ── Product details ────────────────────────────────────────────
    // If initialData was passed (from BinStorePage cards), we already
    // have everything we need — skip the API call entirely to avoid
    // unnecessary network errors. Only fetch when opening cold (no data).
    if (initialData) {
      // Data is already set from useState initializer — nothing else to do.
      setIsLoading(false);
      return;
    }

    const loadProduct = async () => {
      try {
        setIsLoading(true);
        const result = await productsAPI.getById(id);
        if (result) {
          setProduct(normalizeProduct(result));
        }
      } catch (error) {
        console.error('SingleItemPage load error:', error.message);
        Alert.alert('Error', 'Failed to load product details');
      } finally {
        setIsLoading(false);
      }
    };

    loadProduct();
  }, [productId]);

  // ── Image resolution ──────────────────────────────────────────
  const innerImageSource = getImageSource(product?.image_inner);
  const outerImageSource = getImageSource(product?.image_outer);

  // If the resolved source is still PLACEHOLDER but we have the original
  // image object from the local shape, try that as a last resort.
  const resolvedInner =
    innerImageSource === PLACEHOLDER && product?._originalImage
      ? getImageSource(product._originalImage)
      : innerImageSource;

  const resolvedOuter =
    outerImageSource === PLACEHOLDER && product?._originalImage
      ? getImageSource(product._originalImage)
      : outerImageSource;

  const displayImage = activeImage === 'inner' ? resolvedInner : resolvedOuter;

  // Show the Inner/Outer toggle only when both images exist and differ
  const hasBothImages =
    product?.image_inner &&
    product?.image_outer &&
    product.image_inner !== product.image_outer;

  // ── Price helpers ─────────────────────────────────────────────
  const rawPrice = Number(product?.price);
  const rawOffer = Number(product?.offer_price);
  const hasDiscount =
    product?.offer_price && rawOffer > 0 && rawOffer < rawPrice;

  const displayOffer = hasDiscount
    ? `$${rawOffer}`
    : rawPrice
    ? `$${rawPrice}`
    : '';
  const displayOriginal = hasDiscount ? `$${rawPrice}` : null;
  const discountPercent = hasDiscount
    ? `${Math.round(((rawPrice - rawOffer) / rawPrice) * 100)}% Off`
    : '';

  // ── Meta helpers ──────────────────────────────────────────────
  const categoryName =
    product?.category_id?.category_name ||
    product?.category?.category_name ||
    (typeof product?.category_id === 'string' ? product.category_id : null) ||
    null;

  const upcId = product?.upc_id || null;

  const typeLabel =
    product?.type === 1
      ? 'Trending'
      : product?.type === 2
      ? 'Activity Feed'
      : null;

  const createdDate = product?.createdAt
    ? new Date(product.createdAt).toLocaleString()
    : null;

  // ── Favourite ─────────────────────────────────────────────────
  const handleToggleFavorite = () => {
    setIsFavorite(prev => !prev);
    Alert.alert(
      'Success',
      isFavorite ? 'Removed from favorites' : 'Added to favorites',
    );
  };

  // ── Add to library ────────────────────────────────────────────
  const handleAddToLibrary = () => {
    Alert.alert('Success', 'Added to your library');
  };

  // ── Share — same rich logic as the reference code ─────────────
  const handleShare = async () => {
    try {
      const title = product?.title || 'Check out this product';
      const description = product?.description
        ? `${product.description}\n\n`
        : '';
      const priceText = displayOffer
        ? `Price: ${displayOffer}${
            displayOriginal ? `  (was ${displayOriginal})` : ''
          }`
        : '';

      await Share.share({
        title,
        message: `${title}\n\n${description}${priceText}`.trim(),
      });
    } catch (error) {
      console.error('Share error:', error.message);
    }
  };

  // ── Loading screen ────────────────────────────────────────────
  if (isLoading && !product) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#130160" />
        <Text style={styles.loadingText}>Loading product...</Text>
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Product not found.</Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={[styles.loadingText, {color: '#130160', marginTop: 10}]}>
            Go Back
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ── Similar item card — mirrors the reference exactly ─────────
  const renderSimilarItem = ({item}) => (
    <Pressable
      style={styles.similarItemContainer}
      onPress={() =>
        navigation.push('SinglePageItem', {
          productId: item._id || item.id,
          initialData: item,
          section,
          data,
        })
      }>
      <View style={styles.similarItemCard}>
        <Image
          source={getImageSource(item.image || item.product_image)}
          style={styles.similarItemImage}
        />
        <View style={styles.similarItemDescriptionContainer}>
          <Text style={styles.similarItemDescription} numberOfLines={2}>
            {item.description || item.title}
          </Text>
        </View>
        <View style={styles.similarItemPriceContainer}>
          <Text style={styles.similarItemDiscountPrice}>
            {item.discountPrice || (item.price ? `$${item.price}` : '')}
          </Text>
          {item.originalPrice && (
            <Text style={styles.similarItemPriceText}>
              <Text style={styles.similarItemOriginalPrice}>
                {item.originalPrice}
              </Text>
              {'  '}
              {item.totalDiscount}
            </Text>
          )}
        </View>
      </View>
    </Pressable>
  );

  // ── Main render ───────────────────────────────────────────────
  return (
    <ScrollView style={styles.container}>
      <StatusBar translucent={true} backgroundColor="transparent" />
      <ImageBackground
        source={require('../../../assets/vector_1.png')}
        style={styles.vector}
        resizeMode="stretch">
        {/* ── Header — only Share icon, no Heart (matches reference) ── */}
        <View style={styles.header}>
          <View style={styles.headerChild}>
            <Pressable onPress={() => navigation.goBack()}>
              <MaterialIcons name="arrow-back-ios" color="#0D0D26" size={25} />
            </Pressable>
            <Text style={styles.headerText}>Item</Text>
          </View>
          <Pressable onPress={handleShare} style={styles.shareButton}>
            <Share_Icon height={hp(4)} />
          </Pressable>
        </View>

        {/* ── Main image ── */}
        <View style={styles.mainImageContainer}>
          <Image
            source={displayImage}
            style={styles.mainImage}
            resizeMode="cover"
          />
        </View>

        {/* ── Inner / Outer toggle — only shown when both images differ ── */}
        {hasBothImages && (
          <View style={styles.imageToggleRow}>
            <TouchableOpacity
              style={[
                styles.toggleBtn,
                activeImage === 'inner' && styles.toggleBtnActive,
              ]}
              onPress={() => setActiveImage('inner')}>
              <Text
                style={[
                  styles.toggleBtnText,
                  activeImage === 'inner' && styles.toggleBtnTextActive,
                ]}>
                Inner
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.toggleBtn,
                activeImage === 'outer' && styles.toggleBtnActive,
              ]}
              onPress={() => setActiveImage('outer')}>
              <Text
                style={[
                  styles.toggleBtnText,
                  activeImage === 'outer' && styles.toggleBtnTextActive,
                ]}>
                Outer
              </Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.contentContainer}>
          {/* ── Price ── */}
          {displayOffer ? (
            <View style={styles.priceContainer}>
              {displayOriginal && (
                <Text style={styles.originalPrice}>{displayOriginal}</Text>
              )}
              <Text style={styles.discountedPrice}>{displayOffer}</Text>
              {discountPercent ? (
                <Text style={styles.discount}>{discountPercent}</Text>
              ) : null}
            </View>
          ) : null}

          {/* ── Title & details ── */}
          <View style={styles.detailsContainer}>
            <Text style={styles.title}>{product.title}</Text>

            {product.description ? (
              <View style={styles.itemDetailsContainer}>
                <Text style={styles.detailsTitle}>Item Details</Text>
                <Text style={styles.detailsText}>{product.description}</Text>
              </View>
            ) : null}

            {/* ── Metadata ── */}
            {(categoryName || upcId || typeLabel || createdDate) && (
              <View style={styles.itemMetaContainer}>
                {categoryName && (
                  <Text style={styles.metaText}>
                    Category:{' '}
                    <Text style={styles.metaValue}>{categoryName}</Text>
                  </Text>
                )}
                {upcId && (
                  <Text style={styles.metaText}>
                    UPC #: <Text style={styles.metaValue}>{upcId}</Text>
                  </Text>
                )}
                {typeLabel && (
                  <Text style={styles.metaText}>
                    Type - <Text style={styles.metaValue}>{typeLabel}</Text>
                  </Text>
                )}
                {createdDate && (
                  <Text style={styles.metaText}>
                    Date and time -{' '}
                    <Text style={styles.metaValue}>{createdDate}</Text>
                  </Text>
                )}
                {product.status && (
                  <View
                    style={[
                      styles.statusBadge,
                      {
                        backgroundColor:
                          product.status === 'active' ? '#e0f2f1' : '#ffebee',
                      },
                    ]}>
                    <Text
                      style={[
                        styles.statusText,
                        {
                          color:
                            product.status === 'active' ? '#00897b' : '#c62828',
                        },
                      ]}>
                      {product.status}
                    </Text>
                  </View>
                )}
              </View>
            )}
          </View>

          {/* ── Action buttons — My Fav + Add Library ── */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.button}
              onPress={handleToggleFavorite}>
              <Ionicons
                name={isFavorite ? 'heart' : 'heart-outline'}
                size={18}
                color="#000"
              />
              <Text style={styles.buttonText}>
                {isFavorite ? 'Favorited' : 'My Fav'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.button}
              onPress={handleAddToLibrary}>
              <Text style={styles.buttonText}>Add Library</Text>
            </TouchableOpacity>
          </View>

          {/* ── Similar items ── */}
          {similarItems.length > 0 && (
            <View style={styles.similarItemsSection}>
              <Text style={styles.similarItemsTitle}>SIMILAR ITEMS</Text>
              <View style={styles.similarItemsContainer}>
                <FlatList
                  data={similarItems}
                  renderItem={renderSimilarItem}
                  keyExtractor={(item, index) =>
                    (item._id || item.id)?.toString() || `similar-${index}`
                  }
                  numColumns={2}
                  scrollEnabled={false}
                />
              </View>
            </View>
          )}

          <View style={{height: hp(5)}} />
        </View>
      </ImageBackground>
    </ScrollView>
  );
};

export default SingleItemPage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: wp(100),
    backgroundColor: '#E6F3F5',
  },
  vector: {
    flex: 1,
    width: wp(100),
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E6F3F5',
    gap: hp(1.5),
  },
  loadingText: {
    fontFamily: 'Nunito-Regular',
    fontSize: hp(2),
    color: '#524B6B',
  },

  // ── Header ──
  header: {
    width: wp(100),
    height: hp(7),
    marginTop: '10%',
    paddingHorizontal: '5%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerChild: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerText: {
    fontFamily: 'Nunito-Bold',
    fontSize: hp(3),
    textAlign: 'left',
    color: '#0D0140',
  },
  shareButton: {
    padding: 4,
  },

  // ── Main image ──
  mainImageContainer: {
    width: '90%',
    height: hp(27),
    marginHorizontal: '5%',
    borderRadius: 10,
    marginVertical: '5%',
    overflow: 'hidden',
  },
  mainImage: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },

  // ── Inner / Outer toggle ──
  imageToggleRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: hp(1.5),
    gap: 10,
  },
  toggleBtn: {
    paddingHorizontal: wp(7),
    paddingVertical: hp(0.8),
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#130160',
  },
  toggleBtnActive: {
    backgroundColor: '#130160',
  },
  toggleBtnText: {
    fontFamily: 'Nunito-SemiBold',
    fontSize: hp(1.8),
    color: '#130160',
  },
  toggleBtnTextActive: {
    color: '#fff',
  },

  contentContainer: {
    paddingHorizontal: '5%',
  },

  // ── Price ──
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: '1%',
    marginTop: '3.5%',
    gap: 8,
  },
  originalPrice: {
    fontFamily: 'Nunito-Regular',
    fontSize: 16,
    textDecorationLine: 'line-through',
    color: '#666',
  },
  discountedPrice: {
    fontFamily: 'Nunito-Bold',
    fontSize: 18,
    color: '#000',
  },
  discount: {
    fontFamily: 'Nunito-Bold',
    fontSize: 14,
    color: '#e63946',
  },

  // ── Details ──
  detailsContainer: {
    marginVertical: '6%',
  },
  title: {
    fontFamily: 'Nunito-Bold',
    fontSize: hp(2.5),
    marginBottom: 8,
    color: 'black',
  },
  itemDetailsContainer: {
    marginVertical: '1%',
  },
  detailsTitle: {
    fontFamily: 'Nunito-Bold',
    fontSize: hp(2.2),
    color: '#000',
    marginBottom: 4,
  },
  detailsText: {
    fontFamily: 'Nunito-Regular',
    fontSize: hp(1.8),
    color: '#666',
  },
  itemMetaContainer: {
    marginTop: hp(1.5),
  },
  metaText: {
    fontFamily: 'Nunito-Bold',
    fontSize: hp(2),
    color: '#000',
    marginBottom: 4,
  },
  metaValue: {
    fontFamily: 'Nunito-SemiBold',
    fontSize: hp(1.7),
    color: '#666',
  },
  statusBadge: {
    alignSelf: 'flex-start',
    borderRadius: 16,
    paddingVertical: 4,
    paddingHorizontal: 12,
    marginTop: 8,
  },
  statusText: {
    fontFamily: 'Nunito-SemiBold',
    fontSize: 12,
    textTransform: 'capitalize',
  },

  // ── Action buttons ──
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: '5%',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f1f3f4',
    borderRadius: 4,
    flex: 1,
    marginHorizontal: '2%',
    elevation: 2,
    height: hp(7),
    gap: 4,
  },
  buttonText: {
    fontFamily: 'Nunito-SemiBold',
    color: '#000',
    marginLeft: 4,
  },

  // ── Similar items ──
  similarItemsSection: {
    marginVertical: '3%',
  },
  similarItemsTitle: {
    fontFamily: 'Nunito-Bold',
    fontSize: hp(2.3),
    color: '#000000',
    marginVertical: '5%',
  },
  similarItemsContainer: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
  },
  similarItemContainer: {
    width: wp(45),
    height: hp(22),
    alignItems: 'center',
    marginVertical: '1%',
  },
  similarItemCard: {
    width: wp(43),
    height: hp(22),
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#e6e6e6',
    backgroundColor: '#fff',
  },
  similarItemImage: {
    width: wp(42.5),
    height: hp(13),
    borderRadius: 5,
  },
  similarItemDescriptionContainer: {
    paddingHorizontal: '3%',
    marginTop: '2%',
  },
  similarItemDescription: {
    fontFamily: 'Nunito-SemiBold',
    color: '#000',
    fontSize: hp(1.5),
  },
  similarItemPriceContainer: {
    position: 'absolute',
    bottom: '2%',
    paddingHorizontal: '3%',
  },
  similarItemDiscountPrice: {
    fontFamily: 'Nunito-Bold',
    color: '#000',
    fontSize: hp(1.8),
  },
  similarItemPriceText: {
    color: 'red',
  },
  similarItemOriginalPrice: {
    fontFamily: 'Nunito-Bold',
    color: '#808488',
    fontSize: hp(1.8),
    textDecorationLine: 'line-through',
  },
});
