#pragma strict

import System.Collections.Generic;

/*
 
JSONUtils.js
A JSON Parser for the Unity Game Engine
 
Based on JSONParse.js by Philip Peterson (which is based on json_parse by Douglas Crockford)
 
Modified by Indiana MAGNIEZ
 
*/

public class JSONUtils
{

	private static var at : int;
	
	private static var ch : String;
	
	private static var escapee2 = new Hashtable();
	
	private static var text : String;
	
	private static function error (m: String) : void
	{
	/*
		throw new System.Exception("SyntaxError: \nMessage: "+m+
		                           "\nAt: "+at+
		                           "\nText: "+text);
	*/	                           
	}
	
	private static function _next (c : String) : String
	{
		if(c && c != ch) {
			error("Expected '" + c + "' instead of '" + ch + "'");
		}
		
		
		if(text.length >= at+1) {
			ch = text.Substring(at, 1);
		}
		else {
			ch = "";
		}
		
		at++;
		return ch;
	}
	
	private static function _next () : String
	{
		return _next(null);
	}
	
	private static function number () : Number
	{
		var number:double;
		var str : String = "";
		var digits : List.<String> = new List.<String>(["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"]);
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
			while(_next() && digits.Contains(ch))
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
		number = Number.Parse(str);
		
		if( System.Double.IsNaN(number) )
		{
			error("Bad number");
			return 0;
		}
		else
		{
			return number;
		}
	}
	
	
	private static function string () : System.String
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
		
		var hex : int;
		var i : int;
		var string : String = "";
		var uffff : int;
		
		if(ch == "\"")
		{
			while( _next() )
			{
				if(ch == "\"")
				{
					_next();
					return string;
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
						var m : char = uffff;
						string += m;
					}
					else if(escapee2.ContainsKey(ch))
					{
						string += escapee2[ch];
					}
					else
					{
						break;
					}
				}
				else
				{
					string += ch;
				}
			}
		}
		error("Bad string");
		return "";
	}
	
	
	
	private static function white () : void
	{
		while(ch && (ch.length >= 1 && ch.Chars[0] <= 32)) { // if it's whitespace
			_next();
		}   
	}
	
	private static function value () : System.Object
	{
		white();
		// Again, we have to pass on the switch() statement.
		
		if(ch == "{") {
			//	        return object();
			return hashtable();
		} else if(ch == "[") {
			return array();
		} else if(ch == "\"") {
			return string();
		} else if(ch == "-") {
			return number();
		} else {
			return (ch in ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"]) ? number() : word();
		}
		
	}
	
	private static function word ()
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
	
	private static function array () : List.<Object>
	{
		var array : List.<Object> = new List.<Object>();
		
		if(ch == "[")
		{
			_next("[");
			white();
			if(ch == "]")
			{
				_next("]");
				return array; // empty array
			}
			while(ch)
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
	//	            key = string();
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
	
	private static function hashtable () : Hashtable
	{
		white();
		
		var key : String;
		var object = new Hashtable();
		
		if(ch == "{")
		{
			_next("{");
			white();
			if(ch == "}")
			{
				_next("}");
				return object; // empty object
			}
			while(ch)
			{
				key = string();
				white();
				_next(":");
				object.Add( key, value() );
				white();
				if (ch == "}")
				{
					_next("}");
					return object;
				}
				_next(",");
				white();
			}
		}
		error("Bad hashtable");
		return Hashtable();
	}
	
	
	
	public static function ParseJSON ( source:String ):Hashtable
	{
		var result:Hashtable;
		
		text = source;
		at = 0;
		ch = " ";
		result = hashtable();
		white();
		if (ch)
		{
			error("Syntax error");
		}
		return result;
	}
	
	public static function EscapeString(string:String):String
	{
		return string.Replace("\\","\\\\").Replace("\"","\\\"").Replace("\n","\\n");
	}
	
	public static function Vector3ToHashtable(vector3:Vector3):Hashtable
	{
		var retour:Hashtable = new Hashtable();
		retour.Add("x",vector3.x);
		retour.Add("y",vector3.y);
		retour.Add("z",vector3.z);
		return retour;
	}
	
	public static function HashtableToVector3(hashtable:Hashtable):Vector3
	{
		var xParse:float = float.Parse(hashtable["x"].ToString());
		var yParse:float = float.Parse(hashtable["y"].ToString());
		var zParse:float = float.Parse(hashtable["z"].ToString());
		return Vector3(xParse,yParse,zParse);
	}
	
	public static function HashtableToJSON(hashtable:Hashtable):String
	{
		var retour:Array = new Array();
		for(var key in hashtable.Keys)
		{
			var tempValue = hashtable[key];
			if( typeof(tempValue) == typeof(Hashtable) )
			{
				retour.Add('"'+key+'" : '+HashtableToJSON(tempValue as Hashtable));
			}
			else if( typeof(tempValue) == typeof(List.<Object>) )
			{
				retour.Add('"'+key+'" : '+ArrayToJSON(tempValue as List.<Object>));
			}
			else if( typeof(tempValue) == typeof(String) )
			{
				retour.Add('"'+key+'" : "'+EscapeString(tempValue.ToString())+'"');
			}
			else if( IsNumeric(tempValue) )
			{
				retour.Add('"'+key+'" : '+tempValue.ToString());
			}
			else if( typeof(tempValue) == typeof(boolean) )
			{
				retour.Add('"'+key+'" : '+tempValue.ToString().ToLower());
			}
			else if( typeof(tempValue) == typeof(Object) )
			{
				retour.Add('"'+key+'" : '+ObjectToJSON(tempValue as Object));
			}
			else if( typeof(tempValue) == typeof(Boo.Lang.Hash) )
			{
				retour.Add('"'+key+'" : '+HashtableToJSON(tempValue as Hashtable));
			}
			else if( typeof(tempValue) == typeof(Boo.Lang.Hash[]) )
			{
				tempValue = new List.<Object>(tempValue as Boo.Lang.Hash[]);
				retour.Add('"'+key+'" : '+ArrayToJSON(tempValue));
			}
			else
			{
				//				Debug.Log("HashtableToJSON "+tempValue.ToString()+" of type "+typeof(tempValue));
				//				retour.Add('"'+key+'" : "'+EscapeString(tempValue.ToString())+'"');
			}
		}
		return "{"+retour.Join(",")+"}";
	}
	
	public static function ObjectToJSON( object:Object ):String
	{
		var retour:Array = new Array();
		var objectForJSON = object as Boo.Lang.Hash;
		for(var key in objectForJSON.Keys)
		{
			var tempValue = objectForJSON[key];
			if( typeof(tempValue) == typeof(Hashtable) )
			{
				retour.Add('"'+key+'" : '+HashtableToJSON(tempValue as Hashtable));
			}
			else if( typeof(tempValue) == typeof(List.<Object>) )
			{
				retour.Add('"'+key+'" : '+ArrayToJSON(tempValue as List.<Object>));
			}
			else if( typeof(tempValue) == typeof(String) )
			{
				retour.Add('"'+key+'" : "'+EscapeString(tempValue.ToString())+'"');
			}
			else if( IsNumeric(tempValue) )
			{
				retour.Add('"'+key+'" : '+tempValue.ToString());
			}
			else if( typeof(tempValue) == typeof(boolean) )
			{
				retour.Add('"'+key+'" : '+tempValue.ToString().ToLower());
			}
			else if( typeof(tempValue) == typeof(Object) )
			{
				retour.Add('"'+key+'" : '+ObjectToJSON(tempValue as Object));
			}
			else if( typeof(tempValue) == typeof(Boo.Lang.Hash) )
			{
				retour.Add('"'+key+'" : '+HashtableToJSON(tempValue as Hashtable));
			}
			else if( typeof(tempValue) == typeof(Boo.Lang.Hash[]) )
			{
				tempValue = new List.<Object>(tempValue as Boo.Lang.Hash[]);
				retour.Add('"'+key+'" : '+ArrayToJSON(tempValue));
			}
			else
			{
				//				Debug.Log("ObjectToJSON "+tempValue.ToString()+" of type "+typeof(tempValue));
				//				retour.Add('"'+key+'" : "'+EscapeString(tempValue.ToString())+'"');
			}
		}
		return "{"+retour.Join(",")+"}";
	}
	
	public static function ArrayToJSON(array:List.<Object>):String
	{
		var retour:Array = new Array();
		for(var tempValue in array)
		{
			if( typeof(tempValue) == typeof(Hashtable) )
			{
				retour.Add(HashtableToJSON(tempValue as Hashtable));
			}
			else if( typeof(tempValue) == typeof(List.<Object>) )
			{
				retour.Add(ArrayToJSON(tempValue as List.<Object>));
			}
			else if( typeof(tempValue) == typeof(String) )
			{
				retour.Add('"'+EscapeString(tempValue.ToString())+'"');
			}
			else if( IsNumeric(tempValue) )
			{
				retour.Add(tempValue.ToString());
			}
			else if( typeof(tempValue) == typeof(boolean) )
			{
				retour.Add(tempValue.ToString().ToLower());
			}
			else if( typeof(tempValue) == typeof(Object) )
			{
				retour.Add(ObjectToJSON(tempValue as Object));
			}
			else if( typeof(tempValue) == typeof(Boo.Lang.Hash) )
			{
				retour.Add(HashtableToJSON(tempValue as Hashtable));
			}
			else if( typeof(tempValue) == typeof(Boo.Lang.Hash[]))
			{
				var list : List.<Object> = new List.<Object>(tempValue as Boo.Lang.Hash[]);
				Debug.Log(list.Count);
				retour.Add(ArrayToJSON(tempValue));
			}
			else
			{
				//				Debug.Log("ArrayToJSON "+tempValue.ToString()+" of type "+typeof(tempValue));
				//				retour.Add('"'+EscapeString(tempValue.ToString())+'"');
			}
		}
		return "["+retour.Join(",")+"]";
	}
	
	public static function IsNumeric( tempValue )
	{
		return typeof(tempValue) == typeof(int) || typeof(tempValue) == typeof(float) || typeof(tempValue) == typeof(double);
	}
	
}