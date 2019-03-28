SOURCE_DIR="../mlvis-toolkit"
ROOT_DIR="."
PACKAGES=("feature-list-view" "manifold" "mlvis-common" "multi-way-plot" "segment-filters")

for i in ${PACKAGES[@]}
do
  rm -rf $ROOT_DIR"/src/"$i
  mkdir $ROOT_DIR"/src/"$i
  cp -r $SOURCE_DIR"/packages/"$i"/src/"* $ROOT_DIR"/src/"$i
done

rm -rf "./examples/manifold/src"
mkdir "./examples/manifold/src"
cp -r $SOURCE_DIR"/examples/manifold/src/"* "./examples/manifold/src"