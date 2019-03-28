
OLD_ALIAS="@uber"
NEW_ALIAS="packages"
DIRS=('src' 'examples/manifold/src')

for dir in ${DIRS[@]}
do
  for file in $(find ./${dir} -type f)
  do
    echo $file
    # verifying
    while read line
    do
      # echo $line
      if [[ $line =~ $OLD_ALIAS ]] ; then
        echo $file
        echo $line
        # substring replacement https://www.tldp.org/LDP/abs/html/string-manipulation.html
        # echo ${line//$OLD_ALIAS/$NEW_ALIAS}
      fi
    done < $file

    # replace '@uber' with './src'
    # https://askubuntu.com/questions/20414/find-and-replace-text-within-a-file-using-commands
    sed -i '' 's/@uber/packages/g' $file

  done
done