using UnityEngine;
using System;
using System.Collections;


public class WordLabel:MonoBehaviour{
	
	public TextMesh label;
	public TextMesh shadow;
	public SpriteRenderer bgMiddle;
	public SpriteRenderer bgLeft;
	public SpriteRenderer bgRight;
	public string word;
	public Vector3 destination;
	public bool gotoVerse = false;
	public bool returnedToVerse = false;
	public float startTime;
	public GameManager gameManager;
	public ScoreManager scoreManager;
	public VerseManager verseManager;
	public bool hinting = false;
	public FloatingPoints floatingPoints;
	public Quaternion oldRotation;
	public float scoreCredited;
	public bool exploding = false;
	public Vector3 totalSize;
	public Vector3 nonEdgeSize;
	public Vector3 edgeSize;
	public int wordIndex;
	public bool isFirstInLine;
	public bool isLastInLine;
	public bool rightToLeft;
	public AudioClip sndPop;
	public SceneSetup sceneSetup;
	public float spacing = 0.15f;
	public float alpha = 1.0f;
	
	public static Vector3 versePosition;
	public static Vector3 startPosition;
	
	bool shrinkingEdges = false;
	
	public float GetPercentFell() {
		float maxY = gameManager.topWall.offset.y;
		float minY = gameManager.bottomWall.offset.y;
		float y = transform.position.y;
		float range = (maxY - minY)*.8f;
		float pct = (maxY - y) / range;
		float v = GetComponent<Rigidbody2D>().velocity.magnitude;
		
		//Debug.Log(" v = " + v + " pct = " + pct + " y = " + y + " minY = " + minY);
		
		if ((pct > 0.5f) && (v < 0.2f)) return 1.0f;
		
		if (pct < 0) pct = 0.0f;
		if (pct > 1) pct = 1.0f;
		return pct;
	}	

	public void FixedUpdate() {
	}
	
	public void SetColor(Color color) {
		color.a = alpha;
		bgMiddle.GetComponent<Renderer>().material.color = color;
		if (bgLeft != null) {
			bgLeft.GetComponent<Renderer>().material.color = color;
		}
		if (bgRight != null) {
			bgRight.GetComponent<Renderer>().material.color = color;
		}
	}
	
	public Color GetColor() {
		return bgMiddle.GetComponent<Renderer>().material.color;
	}
	
	public BoxCollider2D boxCollider2D() {
		BoxCollider2D boxCollider2D = GetComponent<BoxCollider2D>();
		return boxCollider2D;
	}
	
	public void SetBlockLength(float l,float h) {
		SpriteRenderer[] elements = new SpriteRenderer[]{bgLeft, bgRight, bgMiddle};
	
		foreach(SpriteRenderer el in elements) {
			if (el != null) {
				el.transform.localScale = Vector3.one;
			}
		}	
		
		Vector3 msize = bgMiddle.GetComponent<Renderer>().bounds.size;
		float dx = 0.0f;
		float dw = 0.0f;
		if (bgLeft == null) {
			dw += spacing*0.5f;
			dx -= dw*0.5f;
		}
		
		if (bgRight == null) {
			dw += spacing*0.5f;
			dx += dw*0.5f;
		}
		
		float yScale = (h) / msize.y;
		float xScale = (l+dw) / msize.x;
		
		bgMiddle.transform.localScale = new Vector3(xScale, yScale, 1.0f);
		bgMiddle.transform.localPosition = new Vector3(dx,0.0f,0.0f);
		
		if (bgLeft != null) {
			bgLeft.transform.localScale = new Vector3(yScale, yScale, 1.0f);
			bgLeft.transform.localPosition = new Vector3(-l*0.5f,0.0f,0.0f);
		}
		
		if (bgRight != null) {
			bgRight.transform.localScale = new Vector3(yScale, yScale, 1.0f);
			bgRight.transform.localPosition = new Vector3(l*0.5f,0.0f,0.0f);
		}
		
		Vector3 sm = bgMiddle.GetComponent<Renderer>().bounds.size;
		
		Vector3 sr = Vector3.zero;

		if (bgLeft != null) {
			sr = bgLeft.GetComponent<Renderer>().bounds.size;
			edgeSize = sr;
		}

		totalSize = new Vector3(edgeSize.x*2.0f+sm.x, sm.y, sm.z);
		nonEdgeSize = new Vector3(sm.x,sm.y,sm.z);
		boxCollider2D().size = new Vector2(totalSize.x,totalSize.y);
		
	}
	
	public IEnumerator ShrinkLeftEdge(float duration) {
		while (shrinkingEdges) {
			yield return new WaitForSeconds(0.1f);
		}
		shrinkingEdges = true;
		Vector3 startScale = bgLeft.transform.localScale;
		Vector3 endScale = new Vector3(0.0f,startScale.y, startScale.z);
		float dw = 0.5f*spacing;
		
		
		// move left edge to the right and shrink
		StartCoroutine(AnimationManager.ScaleOverTime(bgLeft.transform,endScale, duration));
		//AnimationManager.TranslationBy(bgLeft.transform,new Vector3(-1*dw,0,0), duration);
		
		float oldW = bgMiddle.GetComponent<Renderer>().bounds.size.x;
		float newW = oldW+dw;
		startScale = bgMiddle.transform.localScale;
		endScale = new Vector3(startScale.x*newW/oldW, startScale.y, startScale.z);
		
		// scale middle to fill in gap, move right to compensate
		StartCoroutine(AnimationManager.ScaleOverTime(bgMiddle.transform, endScale, duration));
		
		//var endPos : Vector3 = bgMiddle.transform.localPosition + new Vector3(-0.5f*dw,0,0);
		//AnimationManager.Translation(bgMiddle.transform, endPos, duration);
		AnimationManager.GetInstance().TranslationBy(bgMiddle.transform, new Vector3(-0.5f*dw,0.0f,0.0f), duration);
			
		yield return new WaitForSeconds(duration);
		shrinkingEdges = false;
		Destroy(bgLeft.gameObject);
		bgLeft = null;
		//ResetBubble();
	}
	
	public IEnumerator ShrinkRightEdge(float duration) {
		while (shrinkingEdges) {
			yield return new WaitForSeconds(0.1f);
		}
		shrinkingEdges = true;
		Vector3 startScale = bgRight.transform.localScale;
		Vector3 endScale = new Vector3(0.0f,startScale.y, startScale.z);
		float dw = spacing*0.5f;
		
		// move right edge to the right and shrink
		StartCoroutine(AnimationManager.ScaleOverTime(bgRight.transform,endScale, duration));
		//AnimationManager.TranslationBy(bgRight.transform,new Vector3(dw,0,0), duration);
		
	
		float oldW = bgMiddle.GetComponent<Renderer>().bounds.size.x;
		float newW = oldW+dw;
		startScale = bgMiddle.transform.localScale;
		endScale = new Vector3(startScale.x*newW/oldW, startScale.y, startScale.z);
		
		// scale middle to fill in gap, move right to compensate
		StartCoroutine(AnimationManager.ScaleOverTime(bgMiddle.transform, endScale, duration));
		
		//var endPos : Vector3 = bgMiddle.transform.localPosition + new Vector3(0.5f*dw,0,0);
		//AnimationManager.Translation(bgMiddle.transform, endPos, duration);
	
		AnimationManager.GetInstance().TranslationBy(bgMiddle.transform, new Vector3(0.5f*dw,0.0f,0.0f), duration);
		
		yield return new WaitForSeconds(duration);
		shrinkingEdges = false;
		
		Destroy(bgRight.gameObject);
		bgRight = null;
		//ResetBubble();
	}
	
	static public string ReverseString(string s) {
		string str = "";
		for(int i=s.Length-1;i>=0;i--) {
			str += s[i];
		}
		return str;
	}
	
	public void setWord(string w) {
		//var mesh = GetComponent(MeshFilter).mesh;
		string wOriginal = null;
		wOriginal = w;
		string language = VerseManager.GetVerseLanguage();
		
		if (Application.platform == RuntimePlatform.Android) {
		    if(language=="mn")
		    {
		         w = w.Replace("ө", "ø"); 
		         w = w.Replace("Ө", "Ø");
		         w = w.Replace("ү", "v"); 
		         w = w.Replace("Ү", "Y");
		      }
		}
	
		if (rightToLeft) {
			label.text = ReverseString(w);
		} else {
			label.text = w;
		}
		shadow.text = label.text;
		
		word = wOriginal;
		
		SyncFontSize();
		
		ResetBubble();
	}
	
	public void SyncFontSize() {
		int fontSize = (int)75.0f;
		if (SceneSetup.isPhone) {
			fontSize = (int)90.0f;
		}
		SetFontSize(fontSize);
	}
	
	public void SetFontSize(int size) {
		label.fontSize = size;
		shadow.fontSize = size;
		ResetBubble();
	}
	
	public void ResetBubble() {
		Quaternion oldRotation = transform.rotation;
		transform.rotation = Quaternion.identity;
		Vector3 lsize = label.GetComponent<Renderer>().bounds.size;
		float textWidth = lsize.x;
		float textHeight  = lsize.y;
		Vector2 padding = new Vector2(0.0f,textHeight*0.4f);
		float l = textWidth;
		float h = textHeight+2*padding.y;
		
		SetBlockLength(l, h);
		transform.rotation = oldRotation;
	}
	
	public void Awake() {
		sceneSetup = GameObject.Find("SceneSetup").GetComponent<SceneSetup>();
	    scoreManager = GameObject.Find("ScoreManager").GetComponent<ScoreManager>();
		gameManager = GameObject.Find("GameManager").GetComponent<GameManager>();
		verseManager = GameObject.Find("VerseManager").GetComponent<VerseManager>();
	}
	
	public static void ResetVersePosition() {
	    Rect screenBounds = GameManager.screenBounds;
	    float startx = screenBounds.x+screenBounds.width*.075f;
	    if (VerseManager.rightToLeft) {
	    	startx = screenBounds.x+screenBounds.width*(0.925f);
	    }
	    
		startPosition = new Vector3(startx,screenBounds.y-screenBounds.height*0.25f);
		versePosition = startPosition;
	}
	
	public void Start() {
		ResetVersePosition();	
	}
	
	public void Update() {
		if (gotoVerse) {
			float distance = Vector3.Distance(transform.localPosition, destination);
			float speed = 0.5f;
			float elapsedTime = (Time.time-startTime);
			transform.localPosition = Vector3.Lerp(transform.localPosition, destination, speed*elapsedTime);
			if (distance < 0.001f) {
				handleReturnedToVerse();
			}
			transform.rotation = Quaternion.Lerp(oldRotation, Quaternion.Euler(0.0f,0.0f,0.0f),
			elapsedTime*2);
			
		}
		
		float rotation = transform.eulerAngles.z;
		
		if (Mathf.Abs(rotation - 180.0f) < 60.0f) {
			var tmp_cs1 = label.transform.eulerAngles;
            tmp_cs1.z = rotation - 180.0f;
            label.transform.eulerAngles = tmp_cs1;
		} else {
			var tmp_cs2 = label.transform.eulerAngles;
            tmp_cs2.z = rotation;
            label.transform.eulerAngles = tmp_cs2;
		}
		shadow.transform.eulerAngles = label.transform.eulerAngles;
	}
	/*
	function OnCollisionEnter2D(collision : Collision2D) {
	   if (collision) {
	   		var v : float = collision.relativeVelocity.magnitude;
	   		var snd : AudioClip;
	   		if (Random.RandomRange(0.0f,1.0f) > 0.5f) {
	   			snd = bumpSnd;
	   		} else {
	   			snd = bumpSnd2;
	   		}
	   		var vol : float = v/10.0f;
	   		if (vol > 1) vol = 1.0f;
	 	   	audio.PlayOneShot(snd, vol);   		
	  }
	}*/
	
	public WordLabel GetPreviousWordLabel() {
		WordLabel wordLabel = gameManager.GetWordLabelAt(wordIndex-1);	
		// make sure the word label is returned to verse
		if (!wordLabel.returnedToVerse && !wordLabel.gotoVerse) {
			for(int i=0;i<GameManager.wordLabels.Count;i++) {
				WordLabel w = GameManager.wordLabels[i];
				if ((w.returnedToVerse || w.gotoVerse) && (w.word == wordLabel.word)) {
					return w;
				}
			}
		}
		return wordLabel;
	}
	
	public WordLabel GetNextWordLabel() {
		return gameManager.GetWordLabelAt(wordIndex+1);	
	}
	
	public void handleReturnedToVerse() {
		transform.localPosition = destination;
		returnedToVerse = true;
		gotoVerse = false;
		
		float d = 0.25f;
		if (!isFirstInLine) {
			if (rightToLeft) {
				StartCoroutine(ShrinkRightEdge(d));
			} else {
				StartCoroutine(ShrinkLeftEdge(d));
			}
			WordLabel pw = GetPreviousWordLabel();
			if (pw != null) {
				if (rightToLeft) {
					StartCoroutine(pw.ShrinkLeftEdge(d));
				} else {
					StartCoroutine(pw.ShrinkRightEdge(d));
				}
			}
		} else {
			if (gameManager.line > 2) {
			
				PanCamera panWordLabels = transform.parent.GetComponent<PanCamera>();
				if (gameManager.showingSolution) {
					panWordLabels.maxY += totalSize.y;
				} else {
					panWordLabels.ScrollY(totalSize.y);
				}
				
			}
			gameManager.line += 1;
		}

		if (GameManager.autoplaying) {
			StartCoroutine(gameManager.AutoplayNextWord());
		}
	}
	
	
	public void CalculateVersePosition() {
		oldRotation = transform.rotation;
		transform.rotation = Quaternion.Euler(0.0f,0.0f,0.0f);
		
		float wordWidth = nonEdgeSize.x;
		
		float dx = wordWidth + spacing;
	
		if (rightToLeft) {
			dx *= -1.0f;
		} 
		
		versePosition.x += dx;
		
		// z = 1 so placed words are drawn behind other wordlabels
		destination = new Vector3(versePosition.x - dx*0.5f, versePosition.y, 1.0f);
		Rect screenBounds = GameManager.screenBounds;
		float b = 0.95f;
		float maxX = screenBounds.x + screenBounds.width*b;
		float minX = screenBounds.x + screenBounds.width*(1-b);
		
		float vSpacing = nonEdgeSize.y;
		
		transform.rotation = oldRotation;
		
		if (wordIndex == 0) isFirstInLine = true;
		
		if ((!rightToLeft && (destination.x + wordWidth*0.5f) > maxX) ||
		    (rightToLeft && (destination.x - wordWidth*0.5f) < minX))
		 {
			versePosition = new Vector3(startPosition.x,
										versePosition.y-vSpacing,
										0.0f);
			isFirstInLine = true;
			CalculateVersePosition();
			WordLabel pw = GetPreviousWordLabel();
			if (pw != null) {
				pw.isLastInLine = true;
			}
		}
	}
	
	public bool IsAvailable() {
		return GetComponent<Collider2D>().enabled;
	}
	
	public void returnToVerse() {
		if (gotoVerse) return;

		// sync word index incase there is another word label which is duplicate of this one
		if (wordIndex != GameManager.wordIndex) {
			gameManager.SwapWords(wordIndex, GameManager.wordIndex);
		}
		hinting = false;
		GetComponent<Collider2D>().enabled = false;
//		GetComponent<Rigidbody2D>().fixedAngle = true;
		// n Unity 5.1, the fixed angle effect is done via Rigidbody2D.constraints
		GetComponent<Rigidbody2D> ().constraints = RigidbodyConstraints2D.FreezePosition;
		GetComponent<Rigidbody2D>().gravityScale = 0.0f;
		GetComponent<Rigidbody2D>().isKinematic = true;
		GetComponent<Rigidbody2D>().velocity = (Vector2)new Vector3(0.0f,0.0f,0.0f);
		GetComponent<Rigidbody2D>().freezeRotation = true;
		oldRotation = transform.rotation;
		
		alpha = 0.5f;
		SetColor(Color.white);
		
		//transform.rotation = new Quaternion.Euler(0,0,0);
		CalculateVersePosition();
		gotoVerse = true;
		
		startTime = Time.time;
		
		gameManager.HandleWordInactive(this);
		gameManager.nextWord();
		
	}
	
	public IEnumerator HintAt() {
		if (hinting) yield break;

		hinting = true;
		
		while (hinting) {
			if (this == null) yield break;
			StartCoroutine(Blink());
			yield return new WaitForSeconds(0.4f);
		}		
	}
	
	public IEnumerator Blink() {
		Color blinkColor = new Color(0.3f,0.8f,0.3f,1.0f);
		SetColor(blinkColor);
		yield return new WaitForSeconds(0.2f);
		SetColor(Color.white);
	}
	
	public IEnumerator OnMouseDown() { 
		/*
	    var ray : Ray = Camera.main.ScreenPointToRay(Input.mousePosition);
	    var hit : RaycastHit2D = Physics2D.GetRayIntersection(ray,Mathf.Infinity);
	    var wasReallyHit : boolean = false;  
	    if ((hit.collider != null) && (hit.collider.transform == transform))
	    {
	    	wasReallyHit = true;
	    }
	    // fix bug where onmousedown is triggered when it shouldn't be
		if (!wasReallyHit) return;
		 */
		if (gotoVerse) yield break;

		int dScore = 0;
		string str = "";
		bool right = false;
		
		if (returnedToVerse) {
			verseManager.SpeakUtterance(word);
			StartCoroutine(Blink());
			yield break;
		}
		
		if (word == GameManager.currentWord) {
			SetColor(Color.white);
			dScore = gameManager.HandleWordCorrect(this);
			right = true;
			verseManager.SpeakUtterance(word);
			scoreCredited = (float)dScore;
			returnToVerse();
		} else {
			WordLabel wordLabel = gameManager.CheckForActiveDuplicate(this);
			if (wordLabel != null) {
				StartCoroutine(wordLabel.OnMouseDown());
				yield break;
			}
			
			str = scoreManager.HandleWordWrong();
			gameManager.HandleWordWrong();
			SetColor(new Color(0.8f,0.3f,0.3f,1.0f));
			yield return new WaitForSeconds(0.1f);
			right = false;
			SetColor(Color.white);
			
		}
		
		hinting = false;
		
		FloatingPoints clone = null;
        if ((dScore != 0) || (str != "")) {
			clone = null;
			clone = (FloatingPoints)Instantiate(floatingPoints, transform.position, Quaternion.identity);
		}
		
		if (dScore != 0) {
			clone.SetPoints((float)dScore, right);
		}
		
		if (str != "") {
			clone.SetString(str, right);
		}
		
		if (!gameManager.gameStarted) {
			gameManager.StartGame();
		}
	
	}

}
