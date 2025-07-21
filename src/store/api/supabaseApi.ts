import { supabase } from '../../supabase/supabaseClient';
import { User, Receipt, JournalEntry, MileageTrip, Settings } from '../types';
import { Reminder, EmailTemplate, SMSTemplate, ImportedOrder, Integration } from '../slices/automationSlice';

// Auth API
export const authApi = {
  signInWithEmail: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    const { user } = data;
    
    // Get additional user data from users table
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (userError && userError.code !== 'PGRST116') {
      throw userError;
    }

    return {
      id: user.id,
      email: user.email!,
      firstName: userData?.first_name || user.user_metadata?.first_name || '',
      lastName: userData?.last_name || user.user_metadata?.last_name || '',
      businessName: userData?.business_name || user.user_metadata?.business_name || '',
      avatar: userData?.avatar_url || '',
      provider: 'email',
      phone: userData?.phone || '',
      address: userData?.address || '',
      city: userData?.city || '',
      state: userData?.state || '',
      zipCode: userData?.zip_code || '',
      licenseNumber: userData?.license_number || '',
      commissionExpiration: userData?.commission_expiration || '',
    };
  },

  signUpWithEmail: async (email: string, password: string, firstName: string, lastName: string, businessName: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
          business_name: businessName,
        },
      },
    });

    if (error) throw error;

    const { user } = data;

    if (user) {
      // Insert user data into users table
      const { error: insertError } = await supabase.from('users').insert({
        id: user.id,
        email,
        first_name: firstName,
        last_name: lastName,
        business_name: businessName,
      });

      if (insertError) {
        console.error('Insert error:', insertError.message);
      }

      return {
        id: user.id,
        email: user.email!,
        firstName,
        lastName,
        businessName,
        avatar: '',
        provider: 'email',
      };
    }

    throw new Error('User creation failed');
  },

  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },
};

// User API
export const userApi = {
  updateProfile: async (userId: string, updates: Partial<User>, provider?: string) => {
    const updateData = {
      first_name: updates.firstName,
      last_name: updates.lastName,
      email: updates.email,
      business_name: updates.businessName,
      phone: updates.phone,
      address: updates.address,
      city: updates.city,
      state: updates.state,
      zip_code: updates.zipCode,
      license_number: updates.licenseNumber,
      commission_expiration: updates.commissionExpiration || null,
      avatar_url: updates.avatar,
      updated_at: new Date().toISOString()
    };

    let data, error;

    if (provider === 'google') {
      const { data: googleData, error: googleError } = await supabase
        .from('google_users')
        .update(updateData)
        .eq('id', userId)
        .select()
        .single();
      data = googleData;
      error = googleError;
    } else {
      const { data: userData, error: userError } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', userId)
        .select()
        .single();
      data = userData;
      error = userError;
    }

    if (error) throw error;

    return {
      id: userId,
      email: data.email || updates.email || '',
      firstName: data.first_name || updates.firstName || '',
      lastName: data.last_name || updates.lastName || '',
      businessName: data.business_name || updates.businessName || '',
      avatar: data.avatar_url || updates.avatar || '',
      provider,
      phone: data.phone || updates.phone,
      address: data.address || updates.address,
      city: data.city || updates.city,
      state: data.state || updates.state,
      zipCode: data.zip_code || updates.zipCode,
      licenseNumber: data.license_number || updates.licenseNumber,
      commissionExpiration: data.commission_expiration || updates.commissionExpiration,
      createdAt: data.created_at || null,
    };
  },

  loadProfile: async (userId: string, provider?: string) => {
    let userData;

    if (provider === 'google') {
      const { data, error } = await supabase
        .from('google_users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      userData = data;
    } else {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      userData = data;
    }

    return {
      id: userData.id,
      email: userData.email,
      firstName: userData.first_name || '',
      lastName: userData.last_name || '',
      businessName: userData.business_name || '',
      avatar: userData.avatar_url || '',
      provider,
      phone: userData.phone || '',
      address: userData.address || '',
      city: userData.city || '',
      state: userData.state || '',
      zipCode: userData.zip_code || '',
      licenseNumber: userData.license_number || '',
      commissionExpiration: userData.commission_expiration || '',
      createdAt: userData.created_at || '',
    };
  },

  uploadAvatar: async (userId: string, file: File) => {
    const fileExt = file.name.split('.').pop();
    const safeUserId = userId.toString().replace(/[^a-zA-Z0-9]/g, '_');
    const newFilePath = `${safeUserId}.${fileExt}`;

    // Delete existing files
    const { data: existingFiles } = await supabase.storage
      .from('avatar-images')
      .list('', { search: safeUserId });

    if (existingFiles && existingFiles.length > 0) {
      const userFiles = existingFiles.filter(file => 
        file.name.startsWith(safeUserId + '.') || file.name === safeUserId
      );
      
      if (userFiles.length > 0) {
        const filesToDelete = userFiles.map(file => file.name);
        await supabase.storage
          .from('avatar-images')
          .remove(filesToDelete);
      }
    }

    // Upload new file
    const { error: uploadError } = await supabase.storage
      .from('avatar-images')
      .upload(newFilePath, file, {
        upsert: false,
        contentType: file.type,
      });

    if (uploadError) throw uploadError;

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from('avatar-images')
      .getPublicUrl(newFilePath);

    return publicUrlData.publicUrl;
  },
};

// Receipts API
export const receiptsApi = {
  fetchReceipts: async (userId: string) => {
    const { data, error } = await supabase
      .from('receipts')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });

    if (error) throw error;

    return data.map(receipt => ({
      id: receipt.id,
      date: receipt.date,
      vendor: receipt.vendor,
      amount: receipt.amount,
      category: receipt.category,
      description: receipt.description,
      paymentMethod: receipt.payment_method,
      taxDeductible: receipt.tax_deductible,
      imageUrl: receipt.image_url,
      ocrProcessed: receipt.ocr_processed,
      status: receipt.status,
      tags: receipt.tags || [],
      notes: receipt.notes || '',
      userId: receipt.user_id,
    }));
  },

  addReceipt: async (receipt: Omit<Receipt, 'id'>) => {
    const { data, error } = await supabase
      .from('receipts')
      .insert({
        user_id: receipt.userId,
        date: receipt.date,
        vendor: receipt.vendor,
        amount: receipt.amount,
        category: receipt.category,
        description: receipt.description,
        payment_method: receipt.paymentMethod,
        tax_deductible: receipt.taxDeductible,
        image_url: receipt.imageUrl,
        ocr_processed: receipt.ocrProcessed,
        status: receipt.status,
        tags: receipt.tags,
        notes: receipt.notes,
      })
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      date: data.date,
      vendor: data.vendor,
      amount: data.amount,
      category: data.category,
      description: data.description,
      paymentMethod: data.payment_method,
      taxDeductible: data.tax_deductible,
      imageUrl: data.image_url,
      ocrProcessed: data.ocr_processed,
      status: data.status,
      tags: data.tags || [],
      notes: data.notes || '',
      userId: data.user_id,
    };
  },

  updateReceipt: async (receipt: Receipt) => {
    const { data, error } = await supabase
      .from('receipts')
      .update({
        date: receipt.date,
        vendor: receipt.vendor,
        amount: receipt.amount,
        category: receipt.category,
        description: receipt.description,
        payment_method: receipt.paymentMethod,
        tax_deductible: receipt.taxDeductible,
        image_url: receipt.imageUrl,
        ocr_processed: receipt.ocrProcessed,
        status: receipt.status,
        tags: receipt.tags,
        notes: receipt.notes,
        updated_at: new Date().toISOString(),
      })
      .eq('id', receipt.id)
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      date: data.date,
      vendor: data.vendor,
      amount: data.amount,
      category: data.category,
      description: data.description,
      paymentMethod: data.payment_method,
      taxDeductible: data.tax_deductible,
      imageUrl: data.image_url,
      ocrProcessed: data.ocr_processed,
      status: data.status,
      tags: data.tags || [],
      notes: data.notes || '',
      userId: data.user_id,
    };
  },

  deleteReceipt: async (receiptId: string) => {
    const { error } = await supabase
      .from('receipts')
      .delete()
      .eq('id', receiptId);

    if (error) throw error;
    return receiptId;
  },
};

// Journal API
export const journalApi = {
  fetchEntries: async (userId: string) => {
    const { data, error } = await supabase
      .from('journal_entries')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });

    if (error) throw error;

    return data.map(entry => ({
      id: entry.id,
      date: entry.date,
      time: entry.time,
      clientName: entry.client_name,
      clientId: entry.client_id,
      appointmentType: entry.appointment_type,
      documentType: entry.document_type,
      notaryFee: entry.notary_fee,
      location: entry.location,
      witnessRequired: entry.witness_required,
      witnessName: entry.witness_name,
      signature: entry.signature,
      thumbprint: entry.thumbprint,
      idVerified: entry.id_verified,
      idType: entry.id_type,
      idNumber: entry.id_number,
      idExpiration: entry.id_expiration,
      notes: entry.notes || '',
      status: entry.status,
      userId: entry.user_id,
    }));
  },

  addEntry: async (entry: Omit<JournalEntry, 'id'>) => {
    const { data, error } = await supabase
      .from('journal_entries')
      .insert({
        user_id: entry.userId,
        date: entry.date,
        time: entry.time,
        client_name: entry.clientName,
        client_id: entry.clientId,
        appointment_type: entry.appointmentType,
        document_type: entry.documentType,
        notary_fee: entry.notaryFee,
        location: entry.location,
        witness_required: entry.witnessRequired,
        witness_name: entry.witnessName,
        signature: entry.signature,
        thumbprint: entry.thumbprint,
        id_verified: entry.idVerified,
        id_type: entry.idType,
        id_number: entry.idNumber,
        id_expiration: entry.idExpiration,
        notes: entry.notes,
        status: entry.status,
      })
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      date: data.date,
      time: data.time,
      clientName: data.client_name,
      clientId: data.client_id,
      appointmentType: data.appointment_type,
      documentType: data.document_type,
      notaryFee: data.notary_fee,
      location: data.location,
      witnessRequired: data.witness_required,
      witnessName: data.witness_name,
      signature: data.signature,
      thumbprint: data.thumbprint,
      idVerified: data.id_verified,
      idType: data.id_type,
      idNumber: data.id_number,
      idExpiration: data.id_expiration,
      notes: data.notes || '',
      status: data.status,
      userId: data.user_id,
    };
  },

  updateEntry: async (entry: JournalEntry) => {
    const { data, error } = await supabase
      .from('journal_entries')
      .update({
        date: entry.date,
        time: entry.time,
        client_name: entry.clientName,
        client_id: entry.clientId,
        appointment_type: entry.appointmentType,
        document_type: entry.documentType,
        notary_fee: entry.notaryFee,
        location: entry.location,
        witness_required: entry.witnessRequired,
        witness_name: entry.witnessName,
        signature: entry.signature,
        thumbprint: entry.thumbprint,
        id_verified: entry.idVerified,
        id_type: entry.idType,
        id_number: entry.idNumber,
        id_expiration: entry.idExpiration,
        notes: entry.notes,
        status: entry.status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', entry.id)
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      date: data.date,
      time: data.time,
      clientName: data.client_name,
      clientId: data.client_id,
      appointmentType: data.appointment_type,
      documentType: data.document_type,
      notaryFee: data.notary_fee,
      location: data.location,
      witnessRequired: data.witness_required,
      witnessName: data.witness_name,
      signature: data.signature,
      thumbprint: data.thumbprint,
      idVerified: data.id_verified,
      idType: data.id_type,
      idNumber: data.id_number,
      idExpiration: data.id_expiration,
      notes: data.notes || '',
      status: data.status,
      userId: data.user_id,
    };
  },

  deleteEntry: async (entryId: string) => {
    const { error } = await supabase
      .from('journal_entries')
      .delete()
      .eq('id', entryId);

    if (error) throw error;
    return entryId;
  },
};

// Mileage API
export const mileageApi = {
  fetchTrips: async (userId: string) => {
    const { data, error } = await supabase
      .from('mileage_trips')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });

    if (error) throw error;

    return data.map(trip => ({
      id: trip.id,
      startLocation: trip.start_location,
      endLocation: trip.end_location,
      distance: trip.distance,
      date: trip.date,
      purpose: trip.purpose,
      category: trip.category,
      rate: trip.rate,
      amount: trip.amount,
      userId: trip.user_id,
    }));
  },

  addTrip: async (trip: Omit<MileageTrip, 'id'>) => {
    const { data, error } = await supabase
      .from('mileage_trips')
      .insert({
        user_id: trip.userId,
        start_location: trip.startLocation,
        end_location: trip.endLocation,
        distance: trip.distance,
        date: trip.date,
        purpose: trip.purpose,
        category: trip.category,
        rate: trip.rate,
        amount: trip.amount,
      })
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      startLocation: data.start_location,
      endLocation: data.end_location,
      distance: data.distance,
      date: data.date,
      purpose: data.purpose,
      category: data.category,
      rate: data.rate,
      amount: data.amount,
      userId: data.user_id,
    };
  },

  updateTrip: async (trip: MileageTrip) => {
    const { data, error } = await supabase
      .from('mileage_trips')
      .update({
        start_location: trip.startLocation,
        end_location: trip.endLocation,
        distance: trip.distance,
        date: trip.date,
        purpose: trip.purpose,
        category: trip.category,
        rate: trip.rate,
        amount: trip.amount,
        updated_at: new Date().toISOString(),
      })
      .eq('id', trip.id)
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      startLocation: data.start_location,
      endLocation: data.end_location,
      distance: data.distance,
      date: data.date,
      purpose: data.purpose,
      category: data.category,
      rate: data.rate,
      amount: data.amount,
      userId: data.user_id,
    };
  },

  deleteTrip: async (tripId: string) => {
    const { error } = await supabase
      .from('mileage_trips')
      .delete()
      .eq('id', tripId);

    if (error) throw error;
    return tripId;
  },
};

// Settings API
export const settingsApi = {
  fetchSettings: async (userId: string) => {
    const { data, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;

    // If no settings found, return default settings
    if (!data) {
      return {
        id: '',
        userId,
        emailNotifications: true,
        smsNotifications: false,
        pushNotifications: true,
        appointmentReminders: true,
        marketingEmails: false,
        securityAlerts: true,
        profileVisibility: 'private',
        dataSharing: false,
        analyticsTracking: true,
        theme: 'system',
        language: 'en',
        timezone: 'America/Los_Angeles',
        dateFormat: 'MM/DD/YYYY',
        currency: 'USD',
        twoFactorEnabled: false,
        sessionTimeout: 30,
        loginAlerts: true,
        defaultFee: 15.00,
        autoBackup: true,
        exportFormat: 'pdf',
        invoiceTemplate: 'standard',
      };
    }

    return {
      id: data.id,
      userId: data.user_id,
      emailNotifications: data.email_notifications,
      smsNotifications: data.sms_notifications,
      pushNotifications: data.push_notifications,
      appointmentReminders: data.appointment_reminders,
      marketingEmails: data.marketing_emails,
      securityAlerts: data.security_alerts,
      profileVisibility: data.profile_visibility,
      dataSharing: data.data_sharing,
      analyticsTracking: data.analytics_tracking,
      theme: data.theme,
      language: data.language,
      timezone: data.timezone,
      dateFormat: data.date_format,
      currency: data.currency,
      twoFactorEnabled: data.two_factor_enabled,
      sessionTimeout: data.session_timeout,
      loginAlerts: data.login_alerts,
      defaultFee: data.default_fee,
      autoBackup: data.auto_backup,
      exportFormat: data.export_format,
      invoiceTemplate: data.invoice_template,
    };
  },

  updateSettings: async (settings: Settings) => {
    const { data, error } = await supabase
      .from('user_settings')
      .upsert({
        id: settings.id || undefined,
        user_id: settings.userId,
        email_notifications: settings.emailNotifications,
        sms_notifications: settings.smsNotifications,
        push_notifications: settings.pushNotifications,
        appointment_reminders: settings.appointmentReminders,
        marketing_emails: settings.marketingEmails,
        security_alerts: settings.securityAlerts,
        profile_visibility: settings.profileVisibility,
        data_sharing: settings.dataSharing,
        analytics_tracking: settings.analyticsTracking,
        theme: settings.theme,
        language: settings.language,
        timezone: settings.timezone,
        date_format: settings.dateFormat,
        currency: settings.currency,
        two_factor_enabled: settings.twoFactorEnabled,
        session_timeout: settings.sessionTimeout,
        login_alerts: settings.loginAlerts,
        default_fee: settings.defaultFee,
        auto_backup: settings.autoBackup,
        export_format: settings.exportFormat,
        invoice_template: settings.invoiceTemplate,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      userId: data.user_id,
      emailNotifications: data.email_notifications,
      smsNotifications: data.sms_notifications,
      pushNotifications: data.push_notifications,
      appointmentReminders: data.appointment_reminders,
      marketingEmails: data.marketing_emails,
      securityAlerts: data.security_alerts,
      profileVisibility: data.profile_visibility,
      dataSharing: data.data_sharing,
      analyticsTracking: data.analytics_tracking,
      theme: data.theme,
      language: data.language,
      timezone: data.timezone,
      dateFormat: data.date_format,
      currency: data.currency,
      twoFactorEnabled: data.two_factor_enabled,
      sessionTimeout: data.session_timeout,
      loginAlerts: data.login_alerts,
      defaultFee: data.default_fee,
      autoBackup: data.auto_backup,
      exportFormat: data.export_format,
      invoiceTemplate: data.invoice_template,
    };
  },

  exportUserData: async (userId: string, format: 'json' | 'csv' | 'pdf') => {
    // Fetch all user data
    const [receiptsRes, journalRes, mileageRes, settingsRes] = await Promise.all([
      supabase.from('receipts').select('*').eq('user_id', userId),
      supabase.from('journal_entries').select('*').eq('user_id', userId),
      supabase.from('mileage_trips').select('*').eq('user_id', userId),
      supabase.from('user_settings').select('*').eq('user_id', userId).single(),
    ]);

    const exportData = {
      receipts: receiptsRes.data || [],
      journalEntries: journalRes.data || [],
      mileageTrips: mileageRes.data || [],
      settings: settingsRes.data || {},
      exportDate: new Date().toISOString(),
      userId,
    };

    let blob: Blob;

    switch (format) {
      case 'json':
        blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        break;
      case 'csv':
        // Convert to CSV format
        const csvContent = Object.entries(exportData)
          .filter(([key]) => Array.isArray(exportData[key as keyof typeof exportData]))
          .map(([key, value]) => {
            if (Array.isArray(value) && value.length > 0) {
              const headers = Object.keys(value[0]).join(',');
              const rows = value.map(item => Object.values(item).join(',')).join('\n');
              return `${key.toUpperCase()}\n${headers}\n${rows}\n\n`;
            }
            return '';
          })
          .join('');
        blob = new Blob([csvContent], { type: 'text/csv' });
        break;
      default:
        blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    }

    return blob;
  },
};

// Automation API
export const automationApi = {
  fetchReminders: async (userId: string) => {
    const { data, error } = await supabase
      .from('reminders')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data.map(reminder => ({
      id: reminder.id,
      title: reminder.title,
      description: reminder.description,
      triggerType: reminder.trigger_type,
      triggerValue: reminder.trigger_value,
      isActive: reminder.is_active,
      lastTriggered: reminder.last_triggered,
      timesTriggered: reminder.times_triggered,
      userId: reminder.user_id,
    }));
  },

  addReminder: async (reminder: Omit<Reminder, 'id'>) => {
    const { data, error } = await supabase
      .from('reminders')
      .insert({
        user_id: reminder.userId,
        title: reminder.title,
        description: reminder.description,
        trigger_type: reminder.triggerType,
        trigger_value: reminder.triggerValue,
        is_active: reminder.isActive,
        times_triggered: reminder.timesTriggered,
      })
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      title: data.title,
      description: data.description,
      triggerType: data.trigger_type,
      triggerValue: data.trigger_value,
      isActive: data.is_active,
      lastTriggered: data.last_triggered,
      timesTriggered: data.times_triggered,
      userId: data.user_id,
    };
  },

  updateReminder: async (reminder: Reminder) => {
    const { data, error } = await supabase
      .from('reminders')
      .update({
        title: reminder.title,
        description: reminder.description,
        trigger_type: reminder.triggerType,
        trigger_value: reminder.triggerValue,
        is_active: reminder.isActive,
        times_triggered: reminder.timesTriggered,
        updated_at: new Date().toISOString(),
      })
      .eq('id', reminder.id)
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      title: data.title,
      description: data.description,
      triggerType: data.trigger_type,
      triggerValue: data.trigger_value,
      isActive: data.is_active,
      lastTriggered: data.last_triggered,
      timesTriggered: data.times_triggered,
      userId: data.user_id,
    };
  },

  deleteReminder: async (reminderId: string) => {
    const { error } = await supabase
      .from('reminders')
      .delete()
      .eq('id', reminderId);

    if (error) throw error;
    return reminderId;
  },

  fetchEmailTemplates: async (userId: string) => {
    const { data, error } = await supabase
      .from('email_templates')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data.map(template => ({
      id: template.id,
      name: template.name,
      subject: template.subject,
      content: template.content,
      category: template.category,
      timesUsed: template.times_used,
      timesSent: template.times_sent,
      userId: template.user_id,
    }));
  },

  fetchSMSTemplates: async (userId: string) => {
    const { data, error } = await supabase
      .from('sms_templates')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data.map(template => ({
      id: template.id,
      name: template.name,
      content: template.content,
      category: template.category,
      timesSent: template.times_sent,
      userId: template.user_id,
    }));
  },
};

// Import Orders API
export const importOrdersApi = {
  fetchOrders: async (userId: string) => {
    const { data, error } = await supabase
      .from('imported_orders')
      .select('*')
      .eq('user_id', userId)
      .order('imported_at', { ascending: false });

    if (error) throw error;

    return data.map(order => ({
      id: order.id,
      orderNumber: order.order_number,
      signerName: order.signer_name,
      signerPhone: order.signer_phone,
      signerEmail: order.signer_email,
      appointmentDate: order.appointment_date,
      appointmentTime: order.appointment_time,
      address: order.address,
      city: order.city,
      state: order.state,
      zipCode: order.zip_code,
      documentType: order.document_type,
      fee: order.fee,
      mileage: order.mileage,
      status: order.status,
      source: order.source,
      importedAt: order.imported_at,
      notes: order.notes || '',
      specialInstructions: order.special_instructions || '',
      userId: order.user_id,
    }));
  },

  addOrder: async (order: Omit<ImportedOrder, 'id'>) => {
    const { data, error } = await supabase
      .from('imported_orders')
      .insert({
        user_id: order.userId,
        order_number: order.orderNumber,
        signer_name: order.signerName,
        signer_phone: order.signerPhone,
        signer_email: order.signerEmail,
        appointment_date: order.appointmentDate,
        appointment_time: order.appointmentTime,
        address: order.address,
        city: order.city,
        state: order.state,
        zip_code: order.zipCode,
        document_type: order.documentType,
        fee: order.fee,
        mileage: order.mileage,
        status: order.status,
        source: order.source,
        imported_at: order.importedAt,
        notes: order.notes,
        special_instructions: order.specialInstructions,
      })
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      orderNumber: data.order_number,
      signerName: data.signer_name,
      signerPhone: data.signer_phone,
      signerEmail: data.signer_email,
      appointmentDate: data.appointment_date,
      appointmentTime: data.appointment_time,
      address: data.address,
      city: data.city,
      state: data.state,
      zipCode: data.zip_code,
      documentType: data.document_type,
      fee: data.fee,
      mileage: data.mileage,
      status: data.status,
      source: data.source,
      importedAt: data.imported_at,
      notes: data.notes || '',
      specialInstructions: data.special_instructions || '',
      userId: data.user_id,
    };
  },

  updateOrderStatus: async (orderId: string, status: ImportedOrder['status']) => {
    const { data, error } = await supabase
      .from('imported_orders')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', orderId)
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      orderNumber: data.order_number,
      signerName: data.signer_name,
      signerPhone: data.signer_phone,
      signerEmail: data.signer_email,
      appointmentDate: data.appointment_date,
      appointmentTime: data.appointment_time,
      address: data.address,
      city: data.city,
      state: data.state,
      zipCode: data.zip_code,
      documentType: data.document_type,
      fee: data.fee,
      mileage: data.mileage,
      status: data.status,
      source: data.source,
      importedAt: data.imported_at,
      notes: data.notes || '',
      specialInstructions: data.special_instructions || '',
      userId: data.user_id,
    };
  },

  fetchIntegrations: async (userId: string) => {
    const { data, error } = await supabase
      .from('integrations')
      .select('*')
      .eq('user_id', userId);

    if (error) throw error;

    return data.map(integration => ({
      id: integration.id,
      name: integration.name,
      description: integration.description,
      category: integration.category,
      isConnected: integration.is_connected,
      lastSync: integration.last_sync,
      ordersImported: integration.orders_imported,
      status: integration.status,
      features: integration.features || [],
      setupSteps: integration.setup_steps || [],
      userId: integration.user_id,
    }));
  },

  toggleIntegration: async (integrationId: string, isConnected: boolean) => {
    const { data, error } = await supabase
      .from('integrations')
      .update({
        is_connected: isConnected,
        status: isConnected ? 'active' : 'setup_required',
        last_sync: isConnected ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', integrationId)
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      name: data.name,
      description: data.description,
      category: data.category,
      isConnected: data.is_connected,
      lastSync: data.last_sync,
      ordersImported: data.orders_imported,
      status: data.status,
      features: data.features || [],
      setupSteps: data.setup_steps || [],
      userId: data.user_id,
    };
  },
};