// Firebase user management for syncing with Firestore
import type { User, InsertUser } from "@shared/schema";

async function firestoreQuery(projectId: string, apiKey: string, collection: string, docId?: string) {
  const url = docId
    ? `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${collection}/${docId}`
    : `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${collection}`;
  
  const response = await fetch(`${url}?key=${apiKey}`);
  
  if (!response.ok) {
    throw new Error(`Firestore query failed: ${response.statusText}`);
  }
  
  return response.json();
}

export async function getAllUsersFromFirestore(projectId: string, apiKey: string): Promise<User[]> {
  try {
    const data = await firestoreQuery(projectId, apiKey, "users");
    const users: User[] = [];
    
    if (data.documents) {
      for (const doc of data.documents) {
        const fields = doc.fields || {};
        const user: User = {
          id: doc.name.split('/').pop() || "",
          email: fields.email?.stringValue || "",
          name: fields.name?.stringValue || "",
          password: fields.password?.stringValue || "",
          role: fields.role?.stringValue || "view_only",
          permissions: fields.permissions?.arrayValue?.values?.map((v: any) => v.stringValue || "") || [],
          active: fields.active?.booleanValue !== false,
          createdAt: fields.createdAt?.timestampValue ? new Date(fields.createdAt.timestampValue) : new Date(),
        };
        users.push(user);
      }
    }
    
    return users;
  } catch (error) {
    console.error("Error fetching users from Firestore:", error);
    return [];
  }
}

export async function saveUserToFirestore(projectId: string, apiKey: string, user: User): Promise<void> {
  try {
    const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/users/${user.id}?key=${apiKey}`;
    
    const response = await fetch(url, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fields: {
          email: { stringValue: user.email },
          name: { stringValue: user.name },
          password: { stringValue: user.password },
          role: { stringValue: user.role },
          permissions: { arrayValue: { values: user.permissions?.map(p => ({ stringValue: p })) || [] } },
          active: { booleanValue: user.active },
          createdAt: { timestampValue: user.createdAt?.toISOString() || new Date().toISOString() },
        },
      }),
    });
    
    if (!response.ok) {
      console.error("Failed to save user to Firestore:", await response.text());
    }
  } catch (error) {
    console.error("Error saving user to Firestore:", error);
  }
}

export async function deleteUserFromFirestore(projectId: string, apiKey: string, userId: string): Promise<void> {
  try {
    const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/users/${userId}?key=${apiKey}`;
    
    const response = await fetch(url, { method: "DELETE" });
    
    if (!response.ok) {
      console.error("Failed to delete user from Firestore:", await response.text());
    }
  } catch (error) {
    console.error("Error deleting user from Firestore:", error);
  }
}
