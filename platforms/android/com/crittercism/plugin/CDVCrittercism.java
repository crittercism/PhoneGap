package com.crittercism.plugin;

import org.apache.cordova.CallbackContext;
import org.apache.cordova.CordovaInterface;
import org.apache.cordova.CordovaPlugin;
import org.apache.cordova.CordovaWebView;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import android.content.Context;
import android.content.res.Resources;

import com.crittercism.app.Crittercism;

public class CDVCrittercism extends CordovaPlugin {
	public static final String ACTION_INIT = "crittercismInit";
	public static final String ACTION_ADD_BREADCRUMB = "crittercismLeaveBreadcrumb";
	public static final String ACTION_SET_USERNAME = "crittercismSetUsername";
	public static final String ACTION_SET_VALUE_FOR_KEY = "crittercismSetValueForKey";
	public static final String ACTION_LOG_HANDLED_EXCEPTION = "crittercismLogHandledException";
	public static final String ACTION_LOG_CRASH_EXCEPTION = "crittercismLogUnhandledException";

	public static final String APPLICATION_ID = "cr_app_id";
	public static final String STRING = "string";

    private Context context;
    private String packageName;
    private Resources resources;

	@Override
	public void initialize(CordovaInterface cordova, CordovaWebView webView) {
		super.initialize(cordova, webView);
		context = this.cordova.getActivity();
		packageName = context.getPackageName();
		resources = context.getResources();
		String crAppID = context.getString(resources.getIdentifier(APPLICATION_ID, STRING, packageName));
		Crittercism.initialize(context, crAppID);
	}

	@Override
	public boolean execute(String action, JSONArray args, CallbackContext callbackContext) throws JSONException {
		try {
			if(ACTION_INIT.equals(action)) {
				final String appID = args.getString(0);
				cordova.getThreadPool().execute(new Runnable() {
					public void run() {
						Crittercism.initialize(context, appID);
					}
				});
				return true;
			} else if(ACTION_ADD_BREADCRUMB.equals(action)) {
				final String breadcrumb = args.getString(0);
				cordova.getThreadPool().execute(new Runnable() {
					public void run() {
						Crittercism.leaveBreadcrumb(breadcrumb);
					}
				});
				return true;
			} else if (ACTION_SET_USERNAME.equals(action)) {
				final String username = args.getString(0);
				cordova.getThreadPool().execute(new Runnable() {
					public void run() {
						Crittercism.setUsername(username);
					}
				});
				return true;
			} else if (ACTION_SET_VALUE_FOR_KEY.equals(action)) {
				final String value = args.getString(0);
				final String key = args.getString(1);

				cordova.getThreadPool().execute(new Runnable() {
					public void run() {
						JSONObject metadata = new JSONObject();
						try {
							metadata.put(key, value);
						} catch (JSONException e) {
							Crittercism.logHandledException(e);
						}
						Crittercism.setMetadata(metadata);
					}
				});
				return true;
			} else if (ACTION_LOG_HANDLED_EXCEPTION.equals(action)) {
				final String name = args.getString(0);
				final String msg = args.getString(1);
				final String stack = args.getString(2);
				cordova.getThreadPool().execute(new Runnable() {
					public void run() {
						Crittercism._logHandledException(name, msg, stack);
					}
				});
				return true;
			} else if (ACTION_LOG_CRASH_EXCEPTION.equals(action)) {
				final String name = "";
				final String msg = args.getString(0);
				final String stack = args.getString(1);
				cordova.getThreadPool().execute(new Runnable() {
					public void run() {
						Crittercism._logCrashException(name, msg, stack);
					}
				});
				return true;
			}
			return false;
		} catch(Exception e) {
			Crittercism.logHandledException(e);
			return false;
		}
	}
}
