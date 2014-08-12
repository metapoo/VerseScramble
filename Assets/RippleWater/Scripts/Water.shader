Shader "Water"
{
	Properties 
	{
_NormalA("_NormalA", 2D) = "black" {}
_NormalB("_NormalB", 2D) = "black" {}
_NormalC("_NormalC", 2D) = "black" {}
_Tint("_Tint", Color) = (1,1,1,1)
_PanSpeedA("_PanSpeedA", Float) = 0
_PanSpeedB("_PanSpeedB", Float) = 0
_PanSpeedC("_PanSpeedC", Float) = 0
_FalloffPower("_FalloffPower", Range(0.01,5) ) = 1.04
_Spec("_Spec", Color) = (1,1,1,1)
_Gloss("_Gloss", Color) = (1,1,1,1)
_GlossMultiplier("_GlossMultiplier", Float) = 0
_Cube("_Cube", Cube) = "black" {}
_ReflectionWeight("_ReflectionWeight", Range(0,2) ) = 0.5

	}
	
	SubShader 
	{
		Tags
		{
"Queue"="Transparent"
"IgnoreProjector"="False"
"RenderType"="Transparent"

		}

		
Cull Back
ZWrite On
ZTest LEqual
ColorMask RGBA
Fog{
}


		CGPROGRAM
#pragma surface surf BlinnPhongEditor  alpha decal:add vertex:vert
#pragma target 3.0
#pragma glsl

float4x4 _RotationA;
sampler2D _NormalA;
float4x4 _RotationB;
float4x4 _RotationC;
sampler2D _NormalB;
sampler2D _NormalC;
float4 _Tint;
float _PanSpeedA;
float _PanSpeedB;
float _PanSpeedC;
float _FalloffPower;
float4 _Spec;
float4 _Gloss;
float _GlossMultiplier;
samplerCUBE _Cube;
float _ReflectionWeight;

			struct EditorSurfaceOutput {
				half3 Albedo;
				half3 Normal;
				half3 Emission;
				half3 Gloss;
				half Specular;
				half Alpha;
				half4 Custom;
			};
			
			inline half4 LightingBlinnPhongEditor_PrePass (EditorSurfaceOutput s, half4 light)
			{
half3 spec = light.a * s.Gloss;
half4 c;
c.rgb = (s.Albedo * light.rgb + light.rgb * spec);
c.a = s.Alpha;
return c;

			}

			inline half4 LightingBlinnPhongEditor (EditorSurfaceOutput s, half3 lightDir, half3 viewDir, half atten)
			{
				half3 h = normalize (lightDir + viewDir);
				
				half diff = max (0, dot ( lightDir, s.Normal ));
				
				float nh = max (0, dot (s.Normal, h));
				float spec = pow (nh, s.Specular*128.0);
				
				half4 res;
				res.rgb = _LightColor0.rgb * diff;
				res.w = spec * Luminance (_LightColor0.rgb);
				res *= atten * 2.0;

				return LightingBlinnPhongEditor_PrePass( s, res );
			}
			
			struct Input {
				float2 uv_NormalA;
float2 uv_NormalB;
float2 uv_NormalC;
float3 worldRefl;
float3 viewDir;
INTERNAL_DATA

			};

			void vert (inout appdata_full v, out Input o) {
float4 VertexOutputMaster0_0_NoInput = float4(0,0,0,0);
float4 VertexOutputMaster0_1_NoInput = float4(0,0,0,0);
float4 VertexOutputMaster0_2_NoInput = float4(0,0,0,0);
float4 VertexOutputMaster0_3_NoInput = float4(0,0,0,0);


			}
			

			void surf (Input IN, inout EditorSurfaceOutput o) {
				o.Normal = float3(0.0,0.0,1.0);
				o.Alpha = 1.0;
				o.Albedo = 0.0;
				o.Emission = 0.0;
				o.Gloss = 0.0;
				o.Specular = 0.0;
				o.Custom = 0.0;
				
float4 Multiply2=_PanSpeedA.xxxx * _SinTime;
float4 UV_Pan0=float4((IN.uv_NormalA.xyxy).x,(IN.uv_NormalA.xyxy).y + Multiply2.x,(IN.uv_NormalA.xyxy).z,(IN.uv_NormalA.xyxy).w);
float4 MxV0=mul( _RotationA, UV_Pan0 );
float4 Tex2D0=tex2D(_NormalA,MxV0.xy);
float4 Multiply3=_PanSpeedB.xxxx * _SinTime;
float4 UV_Pan1=float4((IN.uv_NormalB.xyxy).x + Multiply3.x,(IN.uv_NormalB.xyxy).y,(IN.uv_NormalB.xyxy).z,(IN.uv_NormalB.xyxy).w);
float4 MxV2=mul( _RotationB, UV_Pan1 );
float4 Tex2D2=tex2D(_NormalB,MxV2.xy);
float4 Multiply4=_PanSpeedC.xxxx * _SinTime;
float4 UV_Pan2=float4((IN.uv_NormalC.xyxy).x + Multiply4.x,(IN.uv_NormalC.xyxy).y,(IN.uv_NormalC.xyxy).z,(IN.uv_NormalC.xyxy).w);
float4 MxV1=mul( _RotationC, UV_Pan2 );
float4 Tex2D1=tex2D(_NormalC,MxV1.xy);
float4 Add0=Tex2D2 + Tex2D1;
float4 Add1=Tex2D0 + Add0;
float4 Normalize1=normalize(Add1);
float4 UnpackNormal0=float4(UnpackNormal(Normalize1).xyz, 1.0);
float4 WorldReflection0=float4( WorldReflectionVector (IN, UnpackNormal0), 1.0);
float4 TexCUBE0=texCUBE(_Cube,WorldReflection0);
float4 Multiply0=_ReflectionWeight.xxxx * TexCUBE0;
float4 Fresnel0=(1.0 - dot( normalize( float4( IN.viewDir.x, IN.viewDir.y,IN.viewDir.z,1.0 ).xyz), normalize( UnpackNormal0.xyz ) )).xxxx;
float4 Pow0=pow(Fresnel0,_FalloffPower.xxxx);
float4 Multiply5=_Tint * Pow0;
float4 Add3=Multiply0 + Multiply5;
float4 Multiply6=_Gloss * _GlossMultiplier.xxxx;
float4 Master0_0_NoInput = float4(0,0,0,0);
float4 Master0_5_NoInput = float4(1,1,1,1);
float4 Master0_7_NoInput = float4(0,0,0,0);
float4 Master0_6_NoInput = float4(1,1,1,1);
o.Normal = UnpackNormal0;
o.Emission = Add3;
o.Specular = Multiply6;
o.Gloss = _Spec;

				o.Normal = normalize(o.Normal);
			}
		ENDCG
	}
	Fallback "Diffuse"
}