using UnityEngine;
using System;
using System.Collections.Generic;
using System.Collections;
using System.Globalization;
using System.Linq;

/*
 
JSONUtils.js
A JSON Parser for the Unity Game Engine
 
Based on JSONParse.js by Philip Peterson (which is based on json_parse by Douglas Crockford)
 
Modified by Indiana MAGNIEZ
 
*/

public class JSONUtils
{

	static int at;
	
	static string ch;
	
	static Hashtable escapee2 = new Hashtable();
	
	static string text;
	static List<string> digits =  new List<string>(new string[]{"0", "1", "2", "3", "4", "5", "6", "7", "8", "9"});
	
	static void error(string m)
	{
		throw new System.Exception("SyntaxError: \nMessage: "+m+
		                           "\nAt: "+at+
		                           "\nText: "+text);
	}
	
	static string _next(string c)
	{
		if((c != null) && c != ch) {
			error("Expected '" + c + "' instead of '" + ch + "'");
		}

		if(text.Length >= at+1) {
			ch = text.Substring(at, 1);
		}
		else {
			ch = "";
		}
		
		at++;

		return ch;
	}
	
	static string _next()
	{
		return _next(null);
	}
	
	static object number()
	{
		double number = 0.0;
		string str = "";
		if(ch == "-")
		{
			str = "-";
			_next("-");
		}
		while(digits.Contains(ch))
		{
			str += ch;
			_next();
		}
		if(ch == ".")
		{
			str += ".";
			while((_next() != null) && digits.Contains(ch))
			{
				str += ch;
			}
		}
		if(ch == "e" || ch == "E")
		{
			str += ch;
			_next();
			if(ch == "-" || ch == "+")
			{
				str += ch;
				_next();
			}
			while(digits.Contains(ch))
			{
				str += ch;
				_next();
			}
		}
		number = double.Parse(str);
		
		if( System.Double.IsNaN(number) )
		{
			error("Bad number");
			return 0.0;
		}
		else
		{
//			Debug.Log ("number % 1 = " + (number % 1) + " test = " + ((number % 1) == 0));
			if ((number % 1) == 0) {
				int integer = Convert.ToInt32 (number);
				return integer;
			} 
			return number;
		}
	}
	
	
	static string _string()
	{
		if (escapee2.Count == 0) {
		                escapee2.Add("\"", "\"");
escapee2.Add("\\", "\\");
escapee2.Add("/", "/");
escapee2.Add("b", "b");
escapee2.Add("f", "\f");
escapee2.Add("n", "\n");
escapee2.Add("r", "\r");
escapee2.Add("t", "\t");

		}
		
		int hex = 0;
		int i = 0;
		string str = "";
		int uffff = 0;
		
		if(ch == "\"")
		{
			while( _next() != null )
			{
				if(ch == "\"")
				{
					_next();
					return str;
				}
				else if (ch == "\\")
				{
					_next();
					if(ch == "u")
					{
						uffff = 0;
						for(i = 0; i < 4; i++)
						{
							hex = System.Convert.ToInt32(_next(), 16);
							if (hex == Mathf.Infinity || hex == Mathf.NegativeInfinity)
							{
								break;
							}
							uffff = uffff * 16 + hex;
						}
						char m = (char)uffff;
						str += m;
					}
					else if(escapee2.ContainsKey(ch))
					{
						str += escapee2[ch];
					}
					else
					{
						break;
					}
				}
				else
				{
					str += ch;
				}
			}
		}
		error("Bad string");
		return "";
	}
	
	static void white()
	{
		while((ch != null) && (ch.Length >= 1 && Char.IsWhiteSpace(ch[0]))) { // if it's whitespace
			_next();
		}   
	}
	
	static object value()
	{
		white();
		// Again, we have to pass on the switch() statement.
		
		if(ch == "{") {
			//	        return object();
			return hashtable();
		} else if(ch == "[") {
			return array();
		} else if(ch == "\"") {
			return _string();
		} else if(ch == "-") {
			return number();
		} else {
			return (digits.Contains(ch)) ? number() : word();
		}
		
	}
	
	static object word() 
	{
		// We don't use a switch() statement because
		// otherwise Unity will complain about
		// unreachable code (in reality it's not unreachable).
		
		if(ch == "t") {
			_next("t");
			_next("r");
			_next("u");
			_next("e");
			return true;
		} else if (ch == "f") {
			_next("f");
			_next("a");
			_next("l");
			_next("s");
			_next("e");
			return false;
		} if(ch == "T") {
			_next("T");
			_next("r");
			_next("u");
			_next("e");
			return true;
		} else if (ch == "F") {
			_next("F");
			_next("a");
			_next("l");
			_next("s");
			_next("e");
			return false;
		} else if (ch == "n") {
			_next("n");
			_next("u");
			_next("l");
			_next("l");
			return null;
		} else if (ch == "N") {
			_next("N");
			_next("u");
			_next("l");
			_next("l");
			return null;
		} else if (ch == "") { 
			return null; // Todo: why is it doing this?
		}
		
		error("Unexpected '" + ch + "'");
		return null;
	}

	static List<object> array()
	{
		List<object> array = new List<object>();
		
		if(ch == "[")
		{
			_next("[");
			white();
			if(ch == "]")
			{
				_next("]");
				return array; // empty array
			}
			while(ch != null)
			{
				array.Add(value());
				white();
				if(ch == "]")
				{
					_next("]");
					return array;
				}
				_next(",");
				white();
			}
		}
		error("Bad array");
		return array;
	}
	
	//	private static function object () : Object
	//	{
	//	    var key;
	//	    var object = {};
	//	    
	//	    if(ch == "{")
	//	    {
	//	        _next("{");
	//	        white();
	//	        if(ch == "}")
	//	        {
	//	            _next("}");
	//	            return object; // empty object
	//	        }
	//	        while(ch)
	//	        {
	//	            key = _string();
	//	            white();
	//	            _next(":");
	//	            object[key] = value();
	//	            white();
	//	            if (ch == "}")
	//	            {
	//	                _next("}");
	//	                return object;
	//	            }
	//	            _next(",");
	//	            white();
	//	        }
	//	    }
	//	    error("Bad object");
	//	}
	
	static Hashtable hashtable()
	{
		white();
		
		string key = null;
		Hashtable obj = new Hashtable();
		
		if(ch == "{")
		{
			_next("{");
			white();
			if(ch == "}")
			{
				_next("}");
				return obj; // empty object
			}
			while(ch != null)
			{
				key = _string();
				white();
				_next(":");
				object val = value ();
				//Debug.Log ("key = " + key + " val = " + val + " hashtable size = " + obj.Count);

				obj.Add( key, val );
				white();
				if (ch == "}")
				{
					_next("}");
					return obj;
				}
				_next(",");
				white();
			}
		}
		error("Bad hashtable");
		return new Hashtable();
	}
	
	
	
	public static Hashtable ParseJSON(string source)
	{
		Hashtable result = null;
		
		text = source;
		at = 0;
		ch = " ";
		result = hashtable();
		white();
		if ((ch != null) && (ch != ""))
		{
			error("Syntax error: " + ch.Length);
		}
		return result;
	}
	
	public static Hashtable Vector3ToHashtable(Vector3 vector3)
	{
		Hashtable retour = new Hashtable();
		retour.Add("x",vector3.x);
		retour.Add("y",vector3.y);
		retour.Add("z",vector3.z);
		return retour;
	}
	
	public static Vector3 HashtableToVector3(Hashtable hashtable)
	{
		float xParse = float.Parse(hashtable["x"].ToString());
		float yParse = float.Parse(hashtable["y"].ToString());
		float zParse = float.Parse(hashtable["z"].ToString());
		return new Vector3(xParse,yParse,zParse);
	}

	internal static string Escape (string aText)
	{
		string result = "";
		foreach (char c in aText) {
			switch (c) {
			case '\\':
				result += "\\\\";
				break;
			case '\"':
				result += "\\\"";
				break;
			case '\n':
				result += "\\n";
				break;
			case '\r':
				result += "\\r";
				break;
			case '\t':
				result += "\\t";
				break;
			case '\b':
				result += "\\b";
				break;
			case '\f':
				result += "\\f";
				break;
			default   :
				result += c;
				break;
			}
		}
		return result;
	}

	public static string HashtableToJSON(Hashtable hashtable)
	{
		List<string> retour = new List<string>();
		foreach(object key in hashtable.Keys)
		{
			object tempValue = hashtable[key];
			//Debug.Log ("key = " + key + " tmpValue = " + tempValue);
			if (tempValue == null) {
				retour.Add ("\""+key+"\" : "+"null");
			} else if( tempValue.GetType() == typeof(Hashtable) )
			{
				retour.Add("\""+key+"\" : "+HashtableToJSON(tempValue as Hashtable));
			}
			else if( tempValue.GetType() == typeof(List<object>) )
			{
				retour.Add("\""+key+"\" : "+ArrayToJSON(tempValue as List<object>));
			}
			else if( tempValue.GetType() == typeof(String) )
			{
				if ((tempValue as String).Contains("\"")) {
					Debug.Log (tempValue);
					Debug.Log (Escape(tempValue.ToString()));

				}
				retour.Add("\""+key+"\" : \""+Escape(tempValue.ToString())+"\"");
			}
			else if( IsNumeric(tempValue) )
			{
				retour.Add("\""+key+"\" : "+tempValue.ToString());
			}
			else if( tempValue.GetType() == typeof(bool) )
			{
				retour.Add("\""+key+"\" : "+tempValue.ToString().ToLower());
			}
			else if( tempValue.GetType() == typeof(Hashtable) )
			{
				retour.Add("\""+key+"\" : "+HashtableToJSON(tempValue as Hashtable));
			}
			else if (tempValue.GetType() == typeof(List<int>)) {
				retour.Add("\""+key+"\" : "+ArrayToJSON(tempValue as List<int>));
			}
			else if (tempValue.GetType() == typeof(List<string>)) {
				retour.Add("\""+key+"\" : "+ArrayToJSON(tempValue as List<string>));
			}
			else
			{
				retour.Add ("\""+key+"\" : "+tempValue.ToString ());
				//				Debug.Log("HashtableToJSON "+tempValue.ToString()+" of type "+typeof(tempValue));
				//				retour.Add('"'+key+'" : "'+Escape(tempValue.ToString())+'"');
			}
		}
		
		string str = String.Join(",",retour.ToArray());
		return "{"+str+"}";
	}
	/*
	public static string ObjectToJSON(object obj)
	{
		List<string> retour = new System.Collections.Generic.List<string>();

		Boo.Lang.Hash objectForJSON = object_cs1 as Boo.Lang.Hash;
		foreach(object key in objectForJSON.Keys)
		{
			object tempValue = objectForJSON[(int)key];
			if( tempValue.GetType() == typeof(Hashtable) )
			{
				retour.Add("\""+key+"\" : "+HashtableToJSON(tempValue as Hashtable));
			}
			else if( tempValue.GetType() == List<Object>.GetType() )
			{
				retour.Add("\""+key+"\" : "+ArrayToJSON(tempValue as List<Object>));
			}
			else if( tempValue.GetType() == typeof(String) )
			{
				retour.Add("\""+key+"\" : \""+Escape(tempValue.ToString())+"\"");
			}
			else if( IsNumeric(tempValue) )
			{
				retour.Add("\""+key+"\" : "+tempValue.ToString());
			}
			else if( tempValue.GetType() == boolean.GetType() )
			{
				retour.Add("\""+key+"\" : "+tempValue.ToString().ToLower());
			}
			else if( tempValue.GetType() == typeof(Object) )
			{
				retour.Add("\""+key+"\" : "+ObjectToJSON(tempValue ));
			}
			else if( tempValue.GetType() == typeof(Boo.Lang.Hash) )
			{
				retour.Add("\""+key+"\" : "+HashtableToJSON(tempValue as Hashtable));
			}
			else if( tempValue.GetType() == Boo.Lang.Hash[].GetType() )
			{
				tempValue = new System.Collections.Generic.List<object>(tempValue as Boo.Lang.Hash[]);
				retour.Add("\""+key+"\" : "+ArrayToJSON((System.Collections.Generic.List<object>)tempValue));
			}
			else
			{
				//				Debug.Log("ObjectToJSON "+tempValue.ToString()+" of type "+typeof(tempValue));
				//				retour.Add('"'+key+'" : "'+Escape(tempValue.ToString())+'"');
			}
		}
		string str = String.Join(",",retour.ToArray());
		return "{"+str+"}";
	}
	*/


	public static string ArrayToJSON(List<string> arr)
	{
		List<object>objs = arr.Cast<object>().ToList();
		return ArrayToJSON (objs);
	}

	public static string ArrayToJSON(List<int> arr)
	{
		List<object>objs = arr.Cast<object>().ToList();
		return ArrayToJSON (objs);
	}

	public static string ArrayToJSON(List<object> array)
	{
		List<string> retour = new System.Collections.Generic.List<string>();
		foreach(object tempValue in array)
		{

			if (tempValue == null) {
				retour.Add (null);
		    }
			else if( tempValue.GetType() == typeof(Hashtable) )
			{
				retour.Add(HashtableToJSON(tempValue as Hashtable));
			}
			else if( tempValue.GetType() == typeof(List<object> ))
			{
				retour.Add(ArrayToJSON(tempValue as List<object>));
			}
			else if( tempValue.GetType() == typeof(String) )
			{
				retour.Add("\""+Escape(tempValue.ToString())+"\"");
			}
			else if( IsNumeric(tempValue) )
			{
				retour.Add(tempValue.ToString());
			}
			else if( tempValue.GetType() == typeof(bool))
			{
				retour.Add(tempValue.ToString().ToLower());
			}
			else if( tempValue.GetType() == typeof(Hashtable) )
			{
				retour.Add(HashtableToJSON(tempValue as Hashtable));
			}
			else if (tempValue.GetType() == typeof(List<int>)) {
				retour.Add(ArrayToJSON (tempValue as List<int>));
			}
			else if (tempValue.GetType() == typeof(List<string>)) {
				retour.Add(ArrayToJSON (tempValue as List<string>));
			}
			else
			{
				retour.Add (tempValue.ToString());
				//				Debug.Log("ArrayToJSON "+tempValue.ToString()+" of type "+typeof(tempValue));
				//				retour.Add('"'+Escape(tempValue.ToString())+'"');
			}
		}
		string str = String.Join(",",retour.ToArray());
		return "["+str+"]";
	}
	
	public static bool IsNumeric(object tempValue)
	{
		return tempValue.GetType() == typeof(int) || tempValue.GetType() == typeof(float) || tempValue.GetType() == typeof(double);
	}

}