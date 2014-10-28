package com.crittercism.plugin;

import java.net.URL;

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
	public static final String ACTION_LOG_NETWORK_REQUEST =  "crittercismLogNetworkRequest";

	public static final String APPLICATION_ID = "cr_app_id";
	public static final String STRING = "string";

	private String packageName;

	@Override
	public void initialize(CordovaInterface cordova, CordovaWebView webView) {
		super.initialize(cordova, webView);
		Context context = this.cordova.getActivity();
		packageName = context.getPackageName();
		Resources resources = context.getResources();
		String crAppID = context.getString(resources.getIdentifier(
				APPLICATION_ID, STRING, packageName));
		Crittercism.initialize(context, crAppID);
	}

	@Override
	public boolean execute(String action, JSONArray args,
			CallbackContext callbackContext) throws JSONException {
		try {
			if (ACTION_ADD_BREADCRUMB.equals(action)) {
				final String breadcrumb = args.getString(0);
				Crittercism.leaveBreadcrumb(breadcrumb);
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
				final String key = args.getString(0);
				final String value = args.getString(1);

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
				final String msg = args.getString(0);
				final String stack = args.getString(1);
				cordova.getThreadPool().execute(new Runnable() {
					public void run() {
						Crittercism._logCrashException(msg, stack);
					}
				});
				return true;
			} else if (ACTION_LOG_NETWORK_REQUEST.equals(action)) {
				final String method = args.getString(0);
				final URL url = new URL(args.getString(1));
				final long responseTime = args.getLong(2);
				final long bytesRead = args.getLong(3);
				final long bytesSent = args.getLong(4);
				final int responseCode = args.getInt(5);
                final int errorInt = args.getInt(6);
                final Exception error = errorInt > 600 && errorInt < 604 ? new CRXMLHttpRequestException(Integer.toString(errorInt)) : null;

				cordova.getThreadPool().execute(new Runnable() {
					@Override
					public void run() {
						Crittercism.logNetworkRequest(method, url, responseTime, bytesRead, bytesSent, responseCode, error);
					}
				});
				return true;
			}
			return false;
		} catch (ThreadDeath td) {
			throw td;
		} catch (Throwable t) {
			Crittercism.logHandledException(t);
			return false;
		}
	}
}
