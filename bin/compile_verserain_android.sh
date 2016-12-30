PLUGINS="/Users/hsiung/git/VerseScramble/Assets/plugins/Android"
CLASS_PATH="$PLUGINS/src/com/hopeofglory/verserain"
cd $PLUGINS
javac $CLASS_PATH/Main.java -bootclasspath /Users/hsiung/Library/Android/sdk/platforms/android-22/android.jar -classpath /Applications/Unity/PlaybackEngines/AndroidPlayer/Variations/mono/Release/Classes/classes.jar -d $PLUGINS/src
jar -cvf $PLUGINS/main.jar -C $PLUGINS/src .
rm $CLASS_PATH/Main.class
