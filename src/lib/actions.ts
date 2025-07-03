
"use server";

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { db } from './firebase';
import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc, Timestamp, orderBy, query, setDoc, getDoc } from 'firebase/firestore';
import type { Order, Product, SellRequest, MyApp } from './types';

// Helper to convert Firestore docs to plain objects, converting Timestamps to Dates
const docToObj = (d: any) => {
    const data = d.data();
    if (!data) return null;
    for (const key in data) {
        if (data[key] instanceof Timestamp) {
            data[key] = data[key].toDate();
        }
    }
    return { id: d.id, ...data };
};

// --- Data Fetching Actions ---

export async function getProducts(): Promise<Product[]> {
    const snapshot = await getDocs(query(collection(db, 'products'), orderBy('title', 'asc')));
    return snapshot.docs.map(docToObj) as Product[];
}

export async function getProduct(id: string): Promise<Product | null> {
    const productDoc = await getDoc(doc(db, 'products', id));
    if (!productDoc.exists()) {
        return null;
    }
    return docToObj(productDoc) as Product;
}


export async function getOrders(): Promise<Order[]> {
    const snapshot = await getDocs(query(collection(db, 'orders'), orderBy('orderDate', 'desc')));
    return snapshot.docs.map(docToObj) as Order[];
}


// --- Order & Payment Actions ---

const purchaseSchema = z.object({
  productId: z.string().min(1),
  customerName: z.string().min(2, "Name is required"),
  customerEmail: z.string().email("Invalid email address"),
  paymentId: z.string().min(10, "A valid Transaction ID is required"),
});

export async function initiatePurchase(prevState: any, formData: FormData) {
  const validatedFields = purchaseSchema.safeParse({
    productId: formData.get('productId'),
    customerName: formData.get('customerName'),
    customerEmail: formData.get('customerEmail'),
    paymentId: formData.get('paymentId'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Validation failed. Please check your inputs.',
      success: false,
      orderId: null,
    };
  }

  const { productId, customerName, customerEmail, paymentId } = validatedFields.data;

  try {
    const product = await getProduct(productId);
    if (!product) {
        return { message: 'Product not found.', success: false, errors: null, orderId: null };
    }
    const discountedPrice = product.price * (1 - (product.discount ?? 0));

    const orderRef = await addDoc(collection(db, 'orders'), {
        productId: product.id,
        productTitle: product.title,
        price: discountedPrice,
        customerName,
        customerEmail,
        paymentId,
        orderDate: new Date(),
        status: 'Pending',
    });
    
    revalidatePath('/wkhanadmin/orders');
    revalidatePath('/wkhanadmin');

    return { success: true, orderId: orderRef.id, message: '', errors: null };
    
  } catch (e) {
    console.error(e);
    return {
      message: 'An unexpected error occurred while creating your order.',
      success: false,
      orderId: null,
      errors: null,
    };
  }
}

export async function updateOrderStatus(orderId: string, status: Order['status']) {
    const orderRef = doc(db, 'orders', orderId);
    await updateDoc(orderRef, { status });
    revalidatePath('/wkhanadmin/orders');
    revalidatePath('/wkhanadmin');
}


// --- Product Actions ---
const productSchema = z.object({
    id: z.string().optional(),
    title: z.string().min(1, 'Title is required'),
    category: z.enum(['Telegram Mini Apps', 'Android Apps', 'Websites', 'Bots', 'Tools', 'Services', 'Games', 'Social Accounts']),
    description: z.string().min(1, 'Description is required'),
    price: z.coerce.number().min(0, 'Price must be positive'),
    discount: z.coerce.number().min(0, 'Discount must be 0 or more').max(1, 'Discount cannot be more than 1 (100%)').optional().nullable(),
    image: z.string().url('Must be a valid URL'),
    livePreviewLink: z.string().url('Must be a valid URL'),
});

export async function saveProduct(productData: Partial<Product>) {
    const validatedFields = productSchema.safeParse(productData);
    if (!validatedFields.success) {
        const errorMessage = validatedFields.error.errors[0]?.message || "Invalid data provided.";
        return { success: false, message: errorMessage };
    }
    const { id, ...data } = validatedFields.data;

    try {
        if (id) {
            await setDoc(doc(db, 'products', id), data, { merge: true });
        } else {
            await addDoc(collection(db, 'products'), { ...data, unitsSold: 0, rating: 0 });
        }
        revalidatePath('/wkhanadmin/products');
        revalidatePath('/');
        revalidatePath('/wkhanadmin');
        return { success: true };
    } catch(e) {
        console.error(e);
        return { success: false, message: 'Failed to save product.' };
    }
}

export async function deleteProduct(id: string) {
    await deleteDoc(doc(db, 'products', id));
    revalidatePath('/wkhanadmin/products');
    revalidatePath('/');
    revalidatePath('/wkhanadmin');
}

// --- Sell Request Actions ---

const sellRequestSchema = z.object({
  productName: z.string().min(2, "Product name is required"),
  productLink: z.string().url("A valid product link is required"),
  price: z.coerce.number().min(0, "Price must be a positive number"),
  email: z.string().email("A valid email is required"),
  phone: z.string().min(1, "A contact number is required"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

export async function submitSellRequest(prevState: any, formData: FormData) {
  const validatedFields = sellRequestSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Validation failed. Please check your inputs.',
      success: false,
    };
  }

  try {
    await addDoc(collection(db, 'sellRequests'), {
      ...validatedFields.data,
      submissionDate: new Date(),
      status: 'Pending',
    });
    
    revalidatePath('/wkhanadmin/sell-requests');
    
    return { success: true, message: 'Your request has been submitted!', errors: null };
  } catch (e) {
    console.error(e);
    return {
      message: 'An unexpected error occurred.',
      success: false,
      errors: null,
    };
  }
}

export async function getSellRequests(): Promise<SellRequest[]> {
    const snapshot = await getDocs(query(collection(db, 'sellRequests'), orderBy('submissionDate', 'desc')));
    return snapshot.docs.map(docToObj) as SellRequest[];
}

export async function updateSellRequestStatus(requestId: string, status: SellRequest['status']) {
    const requestRef = doc(db, 'sellRequests', requestId);
    await updateDoc(requestRef, { status });
    revalidatePath('/wkhanadmin/sell-requests');
}

// --- My App Actions ---

const myAppSchema = z.object({
    id: z.string().optional(),
    name: z.string().min(1, 'App name is required'),
    image: z.string().url('Must be a valid image URL'),
    installLink: z.string().url('Must be a valid install link URL'),
});

export async function getMyApps(): Promise<MyApp[]> {
    const snapshot = await getDocs(query(collection(db, 'myApps'), orderBy('name', 'asc')));
    return snapshot.docs.map(docToObj) as MyApp[];
}

export async function saveMyApp(appData: Partial<MyApp>) {
    const validatedFields = myAppSchema.safeParse(appData);
    if (!validatedFields.success) {
        const errorMessage = validatedFields.error.errors[0]?.message || "Invalid data provided.";
        return { success: false, message: errorMessage };
    }
    const { id, ...data } = validatedFields.data;

    try {
        if (id) {
            await setDoc(doc(db, 'myApps', id), data, { merge: true });
        } else {
            await addDoc(collection(db, 'myApps'), data);
        }
        revalidatePath('/wkhanadmin/my-apps');
        revalidatePath('/my-apps');
        return { success: true };
    } catch(e) {
        console.error(e);
        return { success: false, message: 'Failed to save app.' };
    }
}

export async function deleteMyApp(id: string) {
    await deleteDoc(doc(db, 'myApps', id));
    revalidatePath('/wkhanadmin/my-apps');
    revalidatePath('/my-apps');
}

// --- AI Action (remains a mock) ---

export async function generateAIDescription(title: string, category: string) {
  await new Promise(resolve => setTimeout(resolve, 1000));
  return `An exceptionally crafted ${category.toLowerCase()} template, "${title}" offers a blend of modern aesthetics and robust functionality. It's designed for seamless user experiences and is fully responsive, ensuring your project looks stunning on all devices. Perfect for developers and businesses looking to make a strong digital impact.`;
}
